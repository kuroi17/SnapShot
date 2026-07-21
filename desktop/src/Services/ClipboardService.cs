using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows;

namespace SnapShot.Services;

/// <summary>
/// Copies a transparent PNG bitmap to the system clipboard.
/// Sets both the standard PNG format and CF_BITMAP for maximum app compatibility.
/// </summary>
public static class ClipboardService
{
    /// <summary>
    /// Copies the given bitmap to the clipboard as a transparent PNG.
    /// Must be called on the UI thread (STA).
    /// </summary>
    public static void CopyToClipboard(Bitmap bitmap)
    {
        // Encode to PNG in memory (preserves transparency)
        using var stream = new MemoryStream();
        bitmap.Save(stream, ImageFormat.Png);
        stream.Position = 0;

        var dataObject = new DataObject();

        // PNG format: recognized by Figma, Slack, Discord, Chrome, etc.
        dataObject.SetData("PNG", stream, autoConvert: false);

        // Also set as DIB for legacy apps (Paint, Word older versions)
        // Note: DIB does not support alpha, but provides a fallback
        dataObject.SetData(DataFormats.Bitmap, bitmap, autoConvert: true);

        Clipboard.SetDataObject(dataObject, copy: true);
    }
}
