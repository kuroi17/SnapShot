using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace SnapShot.Services;

/// <summary>
/// Removes the background from a bitmap using the u2netp ONNX model.
///
/// Improvements over v1:
/// - Input/output node names resolved dynamically from the session (no hardcoding)
/// - High-quality bicubic resize for preprocessing (better feature extraction)
/// - Bilinear interpolation when upscaling the mask back to original size
/// - Sigmoid sharpening on the mask for clean, hard edges with anti-aliased borders
/// </summary>
public sealed class BackgroundRemovalService : IDisposable
{
    private const int ModelSize = 320;

    // ImageNet mean/std (u2netp was trained on ImageNet-normalized data)
    private static readonly float[] Mean = [0.485f, 0.456f, 0.406f];
    private static readonly float[] Std  = [0.229f, 0.224f, 0.225f];

    private readonly InferenceSession _session;
    private readonly string _inputName;
    private readonly string _outputName;

    public BackgroundRemovalService(string modelPath)
    {
        var options = new SessionOptions();
        options.GraphOptimizationLevel = GraphOptimizationLevel.ORT_ENABLE_ALL;
        _session = new InferenceSession(modelPath, options);

        // Resolve actual tensor names from the model — don't hardcode
        _inputName  = _session.InputMetadata.Keys.First();
        _outputName = _session.OutputMetadata.Keys.First();
    }

    /// <summary>
    /// Removes the background.
    /// Returns a new 32-bpp ARGB bitmap with transparent background.
    /// Falls back to the original (full opacity) if anything fails.
    /// </summary>
    public Bitmap RemoveBackground(Bitmap source)
    {
        try
        {
            return DoRemoveBackground(source);
        }
        catch
        {
            // Per PLAN.md: fallback — return original image as-is
            return (Bitmap)source.Clone();
        }
    }

    private Bitmap DoRemoveBackground(Bitmap source)
    {
        int origW = source.Width;
        int origH = source.Height;

        // ── Step 1: High-quality bicubic resize to 320×320 ─────────────────────
        using Bitmap resized = ResizeBicubic(source, ModelSize, ModelSize);

        // ── Step 2: Build input tensor [1, 3, 320, 320] — ImageNet-normalised ──
        var inputTensor = new DenseTensor<float>(new[] { 1, 3, ModelSize, ModelSize });

        BitmapData resData = resized.LockBits(
            new Rectangle(0, 0, ModelSize, ModelSize),
            ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        unsafe
        {
            byte* ptr = (byte*)resData.Scan0;
            for (int y = 0; y < ModelSize; y++)
            {
                for (int x = 0; x < ModelSize; x++)
                {
                    int idx = y * resData.Stride + x * 4;
                    float b = ptr[idx + 0] / 255f;
                    float g = ptr[idx + 1] / 255f;
                    float r = ptr[idx + 2] / 255f;

                    inputTensor[0, 0, y, x] = (r - Mean[0]) / Std[0];
                    inputTensor[0, 1, y, x] = (g - Mean[1]) / Std[1];
                    inputTensor[0, 2, y, x] = (b - Mean[2]) / Std[2];
                }
            }
        }
        resized.UnlockBits(resData);

        // ── Step 3: ONNX inference ──────────────────────────────────────────────
        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor(_inputName, inputTensor)
        };

        using IDisposableReadOnlyCollection<DisposableNamedOnnxValue> results =
            _session.Run(inputs, [_outputName]);

        var outputTensor = results.First().AsTensor<float>();

        // ── Step 4: Normalise mask values to [0, 1] ─────────────────────────────
        float minVal = float.MaxValue, maxVal = float.MinValue;
        for (int y = 0; y < ModelSize; y++)
            for (int x = 0; x < ModelSize; x++)
            {
                float v = outputTensor[0, 0, y, x];
                if (v < minVal) minVal = v;
                if (v > maxVal) maxVal = v;
            }

        float range = maxVal - minVal;
        if (range < 1e-6f) range = 1f;

        // Pre-extract mask as a flat float array for fast bilinear lookup
        float[] mask = new float[ModelSize * ModelSize];
        for (int y = 0; y < ModelSize; y++)
            for (int x = 0; x < ModelSize; x++)
                mask[y * ModelSize + x] = (outputTensor[0, 0, y, x] - minVal) / range;

        // ── Step 5: Apply sharpened mask to original-size bitmap ─────────────────
        var output = new Bitmap(origW, origH, PixelFormat.Format32bppArgb);

        BitmapData srcData = source.LockBits(
            new Rectangle(0, 0, origW, origH),
            ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        BitmapData dstData = output.LockBits(
            new Rectangle(0, 0, origW, origH),
            ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

        unsafe
        {
            byte* src = (byte*)srcData.Scan0;
            byte* dst = (byte*)dstData.Scan0;

            for (int y = 0; y < origH; y++)
            {
                for (int x = 0; x < origW; x++)
                {
                    // Map to mask space using bilinear interpolation
                    float maskVal = SampleMaskBilinear(mask,
                        (float)x / origW * (ModelSize - 1),
                        (float)y / origH * (ModelSize - 1));

                    // Sharpen: sigmoid centred at 0.5 with steep slope
                    // This pushes ambiguous pixels toward fully opaque or transparent
                    // while preserving a narrow anti-aliased border
                    float sharpened = Sigmoid((maskVal - 0.5f) * 12f);

                    byte alpha = (byte)(sharpened * 255f);

                    int si = y * srcData.Stride + x * 4;
                    int di = y * dstData.Stride + x * 4;

                    dst[di + 0] = src[si + 0]; // B
                    dst[di + 1] = src[si + 1]; // G
                    dst[di + 2] = src[si + 2]; // R
                    dst[di + 3] = alpha;        // A
                }
            }
        }

        source.UnlockBits(srcData);
        output.UnlockBits(dstData);

        return output;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /// <summary>Bilinear sample from the flat mask array (ModelSize × ModelSize).</summary>
    private static float SampleMaskBilinear(float[] mask, float fx, float fy)
    {
        int x0 = (int)fx, y0 = (int)fy;
        int x1 = Math.Min(x0 + 1, ModelSize - 1);
        int y1 = Math.Min(y0 + 1, ModelSize - 1);
        float dx = fx - x0, dy = fy - y0;

        float v00 = mask[y0 * ModelSize + x0];
        float v10 = mask[y0 * ModelSize + x1];
        float v01 = mask[y1 * ModelSize + x0];
        float v11 = mask[y1 * ModelSize + x1];

        return v00 * (1 - dx) * (1 - dy)
             + v10 * dx       * (1 - dy)
             + v01 * (1 - dx) * dy
             + v11 * dx       * dy;
    }

    /// <summary>
    /// Sigmoid sharpening. Higher multiplier = harder edge.
    /// 12 gives a clean cut with ~2–3px anti-aliased border.
    /// </summary>
    private static float Sigmoid(float x) => 1f / (1f + MathF.Exp(-x));

    /// <summary>High-quality bicubic resize using GDI+ interpolation.</summary>
    private static Bitmap ResizeBicubic(Bitmap source, int width, int height)
    {
        var result = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        using Graphics g = Graphics.FromImage(result);
        g.InterpolationMode  = InterpolationMode.HighQualityBicubic;
        g.CompositingQuality = CompositingQuality.HighQuality;
        g.SmoothingMode      = SmoothingMode.HighQuality;
        g.PixelOffsetMode    = PixelOffsetMode.HighQuality;
        g.DrawImage(source, 0, 0, width, height);
        return result;
    }

    public void Dispose() => _session.Dispose();
}
