using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Windows;
using SnapShot.Models;

namespace SnapShot.Services;

/// <summary>
/// Captures a screen region using BitBlt (GDI), accounting for DPI scaling.
/// Returns a System.Drawing.Bitmap in 32bpp ARGB format.
/// </summary>
public static class ScreenCaptureService
{
    [DllImport("user32.dll")]
    private static extern IntPtr GetDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll")]
    private static extern bool BitBlt(
        IntPtr hdcDest, int nXDest, int nYDest, int nWidth, int nHeight,
        IntPtr hdcSrc, int nXSrc, int nYSrc, uint dwRop);

    private const uint SRCCOPY = 0x00CC0020;

    /// <summary>
    /// Captures the given logical region from the screen.
    /// Converts logical coordinates to physical pixels using system DPI.
    /// </summary>
    public static Bitmap Capture(CaptureRegion region)
    {
        // Get system DPI scale factor
        double dpiScale = GetSystemDpiScale();

        // Convert logical to physical pixels
        int px = (int)Math.Round(region.X      * dpiScale);
        int py = (int)Math.Round(region.Y      * dpiScale);
        int pw = (int)Math.Round(region.Width  * dpiScale);
        int ph = (int)Math.Round(region.Height * dpiScale);

        pw = Math.Max(pw, 1);
        ph = Math.Max(ph, 1);

        var bmp = new Bitmap(pw, ph, PixelFormat.Format32bppArgb);
        using Graphics g = Graphics.FromImage(bmp);

        IntPtr hdcDest = g.GetHdc();
        IntPtr hdcSrc  = GetDC(IntPtr.Zero); // screen DC

        try
        {
            BitBlt(hdcDest, 0, 0, pw, ph, hdcSrc, px, py, SRCCOPY);
        }
        finally
        {
            g.ReleaseHdc(hdcDest);
            ReleaseDC(IntPtr.Zero, hdcSrc);
        }

        return bmp;
    }

    private static double GetSystemDpiScale()
    {
        // Use WPF's DPI-aware source
        using var src = new System.Windows.Forms.Form();
        return src.DeviceDpi / 96.0;
    }
}
