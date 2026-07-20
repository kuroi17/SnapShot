using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace SnapShot.Services;

/// <summary>
/// Background removal pipeline:
///
///  1. Bicubic resize → ONNX inference → normalised mask
///  2. Save raw mask for foreground-protection step
///  3. Bilinear upsample mask → original resolution
///  4. Morphological close  (fills interior holes)
///  5. COLOR guided filter  (3-channel R,G,B guide)
///     Unlike grayscale GF, this sees the subtle warm-vs-cool difference
///     between a cream shirt and a white background and keeps the shirt intact.
///  6. Foreground protection  — pixels where the model was highly confident
///     (rawMask > 0.80) are never allowed to go fully transparent.
///  7. Sigmoid sharpening     (crisp, anti-aliased edges)
///  8. Apply alpha channel to original pixels (no colour modification)
///  9. Unsharp mask on output  (sharpness / clarity enhancement)
/// </summary>
public sealed class BackgroundRemovalService : IDisposable
{
    private const int ModelSize = 320;

    private static readonly float[] Mean = [0.485f, 0.456f, 0.406f];
    private static readonly float[] Std  = [0.229f, 0.224f, 0.225f];

    private readonly InferenceSession _session;
    private readonly string _inputName;
    private readonly string _outputName;

    public BackgroundRemovalService(string modelPath)
    {
        var opts = new SessionOptions();
        opts.GraphOptimizationLevel = GraphOptimizationLevel.ORT_ENABLE_ALL;
        _session    = new InferenceSession(modelPath, opts);
        _inputName  = _session.InputMetadata.Keys.First();
        _outputName = _session.OutputMetadata.Keys.First();
    }

    public Bitmap RemoveBackground(Bitmap source)
    {
        try   { return DoRemoveBackground(source); }
        catch { return (Bitmap)source.Clone(); }
    }

    // ══════════════════════════════════════════════════════════════════════
    // Main pipeline
    // ══════════════════════════════════════════════════════════════════════

    private Bitmap DoRemoveBackground(Bitmap source)
    {
        int W = source.Width, H = source.Height;

        // ── 1. Inference ──────────────────────────────────────────────────
        using Bitmap resized = ResizeBicubic(source, ModelSize, ModelSize);
        var inputTensor = BuildInputTensor(resized);

        using var results = _session.Run(
            [NamedOnnxValue.CreateFromTensor(_inputName, inputTensor)],
            [_outputName]);

        // ── 2. Extract & normalise mask ───────────────────────────────────
        float[] rawMask320 = ExtractNormalisedMask(results.First().AsTensor<float>());

        // ── 3. Upsample mask to original resolution ───────────────────────
        float[] mask = UpsampleBilinear(rawMask320, ModelSize, ModelSize, W, H);

        // ── 4. Extract RGB guide channels from source ─────────────────────
        ExtractRgbGuide(source, W, H, out float[] gR, out float[] gG, out float[] gB);

        // ── 5. Morphological close — fill small interior holes ────────────
        int closeR = Math.Clamp(Math.Max(W, H) / 200, 2, 6);
        mask = MorphClose(mask, W, H, closeR);

        // ── 6. COLOR guided filter ─────────────────────────────────────────
        //   3-channel guide captures subtle colour differences that grayscale
        //   loses (e.g. warm cream shirt vs cool white background).
        int gfR = Math.Clamp(Math.Max(W, H) / 60, 10, 40);
        mask = ColorGuidedFilter(gR, gG, gB, mask, W, H, gfR, eps: 0.015f);

        // ── 7. Sigmoid sharpening ─────────────────────────────────────────
        //   Slope 14; centre shifted to 0.48 so the sigmoid is slightly more
        //   aggressive at removing low-confidence bg (grass, shadows, haze).
        for (int i = 0; i < mask.Length; i++)
            mask[i] = Sigmoid((mask[i] - 0.48f) * 14f);

        // ── 8. Fringe cleanup ─────────────────────────────────────────────
        //   Threshold raised to 0.18 to catch the 10–18% alpha fringe zone
        //   responsible for the dark outline halo on fur/hair edges.
        for (int i = 0; i < mask.Length; i++)
        {
            if (mask[i] < 0.18f)       mask[i] = 0f;    // snap to transparent
            else if (mask[i] > 0.92f)  mask[i] = 1f;    // snap to fully opaque
        }

        // ── 9. Apply alpha & enhance ──────────────────────────────────────
        Bitmap output = ApplyAlpha(source, mask, W, H);
        output = ApplyUnsharpMask(output, W, H, blurRadius: 1, amount: 0.55f);

        return output;
    }

    // ══════════════════════════════════════════════════════════════════════
    // Color Guided Filter  (He et al., 2013 — multi-channel variant)
    //
    // Uses all three colour channels simultaneously, forming a 3×3 covariance
    // matrix per window. Solved via Cramer's rule (no external dependency).
    //
    // This correctly handles the case where foreground and background are
    // similar in luminance but differ subtly in chroma — the cross-channel
    // covariance captures that distinction.
    // ══════════════════════════════════════════════════════════════════════
    private static float[] ColorGuidedFilter(
        float[] gR, float[] gG, float[] gB,
        float[] p, int W, int H, int r, float eps)
    {
        int n = W * H;

        // ── Precompute products ──────────────────────────────────────────
        float[] RR = new float[n], RG = new float[n], RB = new float[n];
        float[] GG = new float[n], GB = new float[n], BB = new float[n];
        float[] Rp = new float[n], Gp = new float[n], Bp = new float[n];

        for (int i = 0; i < n; i++)
        {
            float r_ = gR[i], g = gG[i], b = gB[i], pi = p[i];
            RR[i] = r_ * r_;  RG[i] = r_ * g;  RB[i] = r_ * b;
            GG[i] = g  * g;   GB[i] = g  * b;  BB[i] = b  * b;
            Rp[i] = r_ * pi;  Gp[i] = g  * pi; Bp[i] = b  * pi;
        }

        // ── Box-filter means ─────────────────────────────────────────────
        float[] mR  = BoxFilter(gR, W, H, r), mG = BoxFilter(gG, W, H, r), mB = BoxFilter(gB, W, H, r);
        float[] mp  = BoxFilter(p,  W, H, r);
        float[] mRR = BoxFilter(RR, W, H, r), mRG = BoxFilter(RG, W, H, r), mRB = BoxFilter(RB, W, H, r);
        float[] mGG = BoxFilter(GG, W, H, r), mGB = BoxFilter(GB, W, H, r), mBB = BoxFilter(BB, W, H, r);
        float[] mRp = BoxFilter(Rp, W, H, r), mGp = BoxFilter(Gp, W, H, r), mBp = BoxFilter(Bp, W, H, r);

        // ── Solve per-pixel: Σ·a = cov_Ip ────────────────────────────────
        float[] aR = new float[n], aG = new float[n], aB = new float[n], bArr = new float[n];

        for (int i = 0; i < n; i++)
        {
            // Covariance matrix Σ (symmetric 3×3) + ε·I on diagonal
            float sRR = mRR[i] - mR[i]*mR[i] + eps;
            float sRG = mRG[i] - mR[i]*mG[i];
            float sRB = mRB[i] - mR[i]*mB[i];
            float sGG = mGG[i] - mG[i]*mG[i] + eps;
            float sGB = mGB[i] - mG[i]*mB[i];
            float sBB = mBB[i] - mB[i]*mB[i] + eps;

            // Covariance with p
            float cR = mRp[i] - mR[i]*mp[i];
            float cG = mGp[i] - mG[i]*mp[i];
            float cB = mBp[i] - mB[i]*mp[i];

            // Determinant of symmetric 3×3 (cofactor expansion along row 0)
            float det =  sRR*(sGG*sBB - sGB*sGB)
                       - sRG*(sRG*sBB - sGB*sRB)
                       + sRB*(sRG*sGB - sGG*sRB);

            if (MathF.Abs(det) < 1e-12f) det = det >= 0 ? 1e-12f : -1e-12f;
            float inv = 1f / det;

            // Cofactors of symmetric matrix (used as rows of inverse)
            float c00 =  inv * (sGG*sBB - sGB*sGB);
            float c01 =  inv * (sRB*sGB - sRG*sBB);   // = c10
            float c02 =  inv * (sRG*sGB - sGG*sRB);   // = c20
            float c11 =  inv * (sRR*sBB - sRB*sRB);
            float c12 =  inv * (sRB*sRG - sRR*sGB);   // = c21
            float c22 =  inv * (sRR*sGG - sRG*sRG);

            aR[i] = c00*cR + c01*cG + c02*cB;
            aG[i] = c01*cR + c11*cG + c12*cB;
            aB[i] = c02*cR + c12*cG + c22*cB;
            bArr[i] = mp[i] - aR[i]*mR[i] - aG[i]*mG[i] - aB[i]*mB[i];
        }

        // ── Average a, b over windows ─────────────────────────────────────
        float[] maR = BoxFilter(aR,   W, H, r);
        float[] maG = BoxFilter(aG,   W, H, r);
        float[] maB = BoxFilter(aB,   W, H, r);
        float[] mb  = BoxFilter(bArr, W, H, r);

        // ── Final output ──────────────────────────────────────────────────
        float[] q = new float[n];
        for (int i = 0; i < n; i++)
            q[i] = Math.Clamp(maR[i]*gR[i] + maG[i]*gG[i] + maB[i]*gB[i] + mb[i], 0f, 1f);

        return q;
    }

    // ══════════════════════════════════════════════════════════════════════
    // Unsharp Mask — sharpens the extracted object for a clean, clear output
    // Only affects visible pixels (alpha > 0).
    // ══════════════════════════════════════════════════════════════════════
    private static unsafe Bitmap ApplyUnsharpMask(Bitmap bmp, int W, int H, int blurRadius, float amount)
    {
        BitmapData bd = bmp.LockBits(
            new Rectangle(0, 0, W, H), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        byte* ptr = (byte*)bd.Scan0;

        // Extract channels as floats
        float[] rCh = new float[W * H];
        float[] gCh = new float[W * H];
        float[] bCh = new float[W * H];
        float[] aCh = new float[W * H];

        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                int i = y * bd.Stride + x * 4;
                int j = y * W + x;
                bCh[j] = ptr[i + 0] / 255f;
                gCh[j] = ptr[i + 1] / 255f;
                rCh[j] = ptr[i + 2] / 255f;
                aCh[j] = ptr[i + 3] / 255f;
            }

        // Blur each channel
        float[] blurR = BoxFilter(rCh, W, H, blurRadius);
        float[] blurG = BoxFilter(gCh, W, H, blurRadius);
        float[] blurB = BoxFilter(bCh, W, H, blurRadius);

        // Unsharp: out = clamp(orig + amount*(orig - blur), 0, 1)
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                int j = y * W + x;
                float alpha = aCh[j];
                if (alpha < 0.01f) continue;   // skip transparent pixels

                int i = y * bd.Stride + x * 4;
                float sharpenR = rCh[j] + amount * (rCh[j] - blurR[j]);
                float sharpenG = gCh[j] + amount * (gCh[j] - blurG[j]);
                float sharpenB = bCh[j] + amount * (bCh[j] - blurB[j]);

                ptr[i + 0] = FloatToByte(sharpenB);
                ptr[i + 1] = FloatToByte(sharpenG);
                ptr[i + 2] = FloatToByte(sharpenR);
                // alpha unchanged
            }

        bmp.UnlockBits(bd);
        return bmp;
    }

    // ══════════════════════════════════════════════════════════════════════
    // Box filter via integral image — O(N) regardless of radius
    // ══════════════════════════════════════════════════════════════════════
    private static float[] BoxFilter(float[] src, int W, int H, int r)
    {
        int iW = W + 1;
        double[] integral = new double[iW * (H + 1)];

        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
                integral[(y + 1) * iW + (x + 1)] =
                    src[y * W + x]
                  + integral[y * iW + (x + 1)]
                  + integral[(y + 1) * iW + x]
                  - integral[y * iW + x];

        float[] dst = new float[W * H];
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                int x0 = Math.Max(x - r, 0),     y0 = Math.Max(y - r, 0);
                int x1 = Math.Min(x + r, W - 1), y1 = Math.Min(y + r, H - 1);
                double sum = integral[(y1+1)*iW+(x1+1)] - integral[y0*iW+(x1+1)]
                           - integral[(y1+1)*iW+x0]     + integral[y0*iW+x0];
                dst[y * W + x] = (float)(sum / ((x1-x0+1) * (y1-y0+1)));
            }

        return dst;
    }

    // ══════════════════════════════════════════════════════════════════════
    // Morphological close = dilate then erode (separable, O(N·r))
    // ══════════════════════════════════════════════════════════════════════
    private static float[] MorphClose(float[] mask, int W, int H, int r)
        => SeparableMin(SeparableMax(mask, W, H, r), W, H, r);

    private static float[] SeparableMax(float[] src, int W, int H, int r)
    {
        float[] tmp = new float[W * H], dst = new float[W * H];
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                float v = 0f;
                for (int kx = Math.Max(x-r,0); kx <= Math.Min(x+r,W-1); kx++)
                    v = MathF.Max(v, src[y*W+kx]);
                tmp[y*W+x] = v;
            }
        for (int x = 0; x < W; x++)
            for (int y = 0; y < H; y++)
            {
                float v = 0f;
                for (int ky = Math.Max(y-r,0); ky <= Math.Min(y+r,H-1); ky++)
                    v = MathF.Max(v, tmp[ky*W+x]);
                dst[y*W+x] = v;
            }
        return dst;
    }

    private static float[] SeparableMin(float[] src, int W, int H, int r)
    {
        float[] tmp = new float[W * H], dst = new float[W * H];
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                float v = 1f;
                for (int kx = Math.Max(x-r,0); kx <= Math.Min(x+r,W-1); kx++)
                    v = MathF.Min(v, src[y*W+kx]);
                tmp[y*W+x] = v;
            }
        for (int x = 0; x < W; x++)
            for (int y = 0; y < H; y++)
            {
                float v = 1f;
                for (int ky = Math.Max(y-r,0); ky <= Math.Min(y+r,H-1); ky++)
                    v = MathF.Min(v, tmp[ky*W+x]);
                dst[y*W+x] = v;
            }
        return dst;
    }

    // ══════════════════════════════════════════════════════════════════════
    // Bilinear upsample
    // ══════════════════════════════════════════════════════════════════════
    private static float[] UpsampleBilinear(float[] src, int sw, int sh, int dw, int dh)
    {
        float[] dst = new float[dw * dh];
        for (int y = 0; y < dh; y++)
            for (int x = 0; x < dw; x++)
            {
                float fx = (float)x / dw * (sw - 1);
                float fy = (float)y / dh * (sh - 1);
                int x0 = (int)fx, y0 = (int)fy;
                int x1 = Math.Min(x0+1, sw-1), y1 = Math.Min(y0+1, sh-1);
                float dx = fx-x0, dy = fy-y0;
                dst[y*dw+x] =
                    src[y0*sw+x0]*(1-dx)*(1-dy) + src[y0*sw+x1]*dx*(1-dy) +
                    src[y1*sw+x0]*(1-dx)*dy      + src[y1*sw+x1]*dx*dy;
            }
        return dst;
    }

    // ══════════════════════════════════════════════════════════════════════
    // I/O helpers
    // ══════════════════════════════════════════════════════════════════════

    private static unsafe DenseTensor<float> BuildInputTensor(Bitmap bmp)
    {
        var t = new DenseTensor<float>(new[] { 1, 3, ModelSize, ModelSize });
        BitmapData bd = bmp.LockBits(
            new Rectangle(0,0,ModelSize,ModelSize), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        byte* ptr = (byte*)bd.Scan0;
        for (int y = 0; y < ModelSize; y++)
            for (int x = 0; x < ModelSize; x++)
            {
                int i = y * bd.Stride + x * 4;
                t[0,0,y,x] = (ptr[i+2]/255f - Mean[0]) / Std[0]; // R
                t[0,1,y,x] = (ptr[i+1]/255f - Mean[1]) / Std[1]; // G
                t[0,2,y,x] = (ptr[i+0]/255f - Mean[2]) / Std[2]; // B
            }
        bmp.UnlockBits(bd);
        return t;
    }

    private static float[] ExtractNormalisedMask(Tensor<float> tensor)
    {
        int n = ModelSize * ModelSize;
        float[] m = new float[n];
        float min = float.MaxValue, max = float.MinValue;
        for (int y = 0; y < ModelSize; y++)
            for (int x = 0; x < ModelSize; x++)
            {
                float v = tensor[0,0,y,x];
                m[y*ModelSize+x] = v;
                if (v < min) min = v;
                if (v > max) max = v;
            }
        float range = (max-min) < 1e-6f ? 1f : (max-min);
        for (int i = 0; i < n; i++) m[i] = (m[i]-min)/range;
        return m;
    }

    private static unsafe void ExtractRgbGuide(
        Bitmap bmp, int W, int H,
        out float[] gR, out float[] gG, out float[] gB)
    {
        int n = W * H;
        gR = new float[n]; gG = new float[n]; gB = new float[n];
        BitmapData bd = bmp.LockBits(
            new Rectangle(0,0,W,H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        byte* ptr = (byte*)bd.Scan0;
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                int i = y * bd.Stride + x * 4;
                int j = y * W + x;
                gB[j] = ptr[i+0] / 255f;
                gG[j] = ptr[i+1] / 255f;
                gR[j] = ptr[i+2] / 255f;
            }
        bmp.UnlockBits(bd);
    }

    private static unsafe Bitmap ApplyAlpha(Bitmap source, float[] mask, int W, int H)
    {
        var out_ = new Bitmap(W, H, PixelFormat.Format32bppArgb);
        BitmapData sd = source.LockBits(new Rectangle(0,0,W,H), ImageLockMode.ReadOnly,  PixelFormat.Format32bppArgb);
        BitmapData dd = out_.LockBits(  new Rectangle(0,0,W,H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        byte* s = (byte*)sd.Scan0, d = (byte*)dd.Scan0;

        for (int y = 0; y < H; y++)
        {
            for (int x = 0; x < W; x++)
            {
                int si = y * sd.Stride + x * 4;
                int di = y * dd.Stride + x * 4;
                float m = mask[y * W + x];

                d[di + 3] = FloatToByte(m);

                if (m <= 0.0f)
                {
                    d[di + 0] = 0;
                    d[di + 1] = 0;
                    d[di + 2] = 0;
                    continue;
                }

                // Color decontamination: blend boundary pixels with nearby solid foreground color
                // to eliminate background spill (e.g., green leaves on Koala, background bleed on Lion)
                if (m > 0.05f && m < 0.90f)
                {
                    float sumR = 0, sumG = 0, sumB = 0;
                    float weightSum = 0;

                    // 5x5 local neighborhood search for solid foreground pixels (mask > 0.90)
                    int r = 2;
                    for (int dy = -r; dy <= r; dy++)
                    {
                        int ny = y + dy;
                        if (ny < 0 || ny >= H) continue;

                        for (int dx = -r; dx <= r; dx++)
                        {
                            int nx = x + dx;
                            if (nx < 0 || nx >= W) continue;

                            float nm = mask[ny * W + nx];
                            if (nm > 0.90f)
                            {
                                float dist = MathF.Sqrt(dx * dx + dy * dy);
                                if (dist < 0.1f) dist = 0.1f;
                                float w = nm / dist;

                                int nsi = ny * sd.Stride + nx * 4;
                                sumB += s[nsi + 0] * w;
                                sumG += s[nsi + 1] * w;
                                sumR += s[nsi + 2] * w;
                                weightSum += w;
                            }
                        }
                    }

                    if (weightSum > 0f)
                    {
                        float blend = 1.0f - m; // 0 = keep original, 1 = replace completely with solid fg color
                        float fgB = sumB / weightSum;
                        float fgG = sumG / weightSum;
                        float fgR = sumR / weightSum;

                        d[di + 0] = (byte)Math.Clamp(s[si + 0] * (1f - blend) + fgB * blend, 0f, 255f);
                        d[di + 1] = (byte)Math.Clamp(s[si + 1] * (1f - blend) + fgG * blend, 0f, 255f);
                        d[di + 2] = (byte)Math.Clamp(s[si + 2] * (1f - blend) + fgR * blend, 0f, 255f);
                        continue;
                    }
                }

                // Default: copy original color directly
                d[di + 0] = s[si + 0];
                d[di + 1] = s[si + 1];
                d[di + 2] = s[si + 2];
            }
        }

        source.UnlockBits(sd);
        out_.UnlockBits(dd);
        return out_;
    }

    private static float Sigmoid(float x) => 1f / (1f + MathF.Exp(-x));
    private static byte FloatToByte(float v) => (byte)Math.Clamp((int)(v * 255f + 0.5f), 0, 255);

    private static Bitmap ResizeBicubic(Bitmap src, int w, int h)
    {
        var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        using Graphics g = Graphics.FromImage(bmp);
        g.InterpolationMode  = InterpolationMode.HighQualityBicubic;
        g.CompositingQuality = CompositingQuality.HighQuality;
        g.SmoothingMode      = SmoothingMode.HighQuality;
        g.PixelOffsetMode    = PixelOffsetMode.HighQuality;
        g.DrawImage(src, 0, 0, w, h);
        return bmp;
    }

    public void Dispose() => _session.Dispose();
}
