using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using SnapShot.Services;

namespace SnapShot;

public partial class RefinementWindow : Window
{
    private readonly Bitmap _rawCapture;
    private readonly BackgroundRemovalService _bgService;
    private PreparedRemovalState? _removalState;
    private Bitmap? _processedBitmap;
    private CancellationTokenSource? _updateCts;
    private bool _isPreparing = true;
    private bool[]? _manualRestoreMask;

    [System.Runtime.InteropServices.DllImport("gdi32.dll")]
    [return: System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)]
    private static extern bool DeleteObject(IntPtr hObject);

    public RefinementWindow(Bitmap rawCapture, BackgroundRemovalService bgService)
    {
        InitializeComponent();
        _rawCapture = rawCapture;
        _bgService = bgService;
    }

    public bool IsBackgroundRemoved => RemoveBgCheckBox.IsChecked == true;

    private async void Window_Loaded(object sender, RoutedEventArgs e)
    {
        // 1. Instantly display the original capture while AI is processing
        PreviewImage.Source = ConvertBitmap(_rawCapture);

        // 2. Disable controls until preparation finishes
        ThresholdSlider.IsEnabled = false;
        RemoveBgCheckBox.IsEnabled = false;
        RestoreBrushCheckBox.IsEnabled = false;

        try
        {
            // Run u2netp and guided filter on a background thread
            _removalState = await Task.Run(() => _bgService.Prepare(_rawCapture));
            _manualRestoreMask = new bool[_rawCapture.Width * _rawCapture.Height];
            _isPreparing = false;
            
            ThresholdSlider.IsEnabled = true;
            RemoveBgCheckBox.IsEnabled = true;
            RestoreBrushCheckBox.IsEnabled = true;

            // Trigger the initial background-removed preview
            UpdatePreview();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to run background removal: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            _isPreparing = false;
        }
    }

    private void ThresholdSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (_isPreparing || _removalState == null || RemoveBgCheckBox.IsChecked == false)
            return;

        UpdatePreview();
    }

    private void RemoveBgCheckBox_Changed(object sender, RoutedEventArgs e)
    {
        if (_isPreparing)
            return;

        if (RemoveBgCheckBox.IsChecked == true)
        {
            SliderContainer.Visibility = Visibility.Visible;
            RestoreBrushCheckBox.Visibility = Visibility.Visible;
            if (RestoreBrushCheckBox.IsChecked == true)
            {
                BrushSizeContainer.Visibility = Visibility.Visible;
                BackgroundOriginalImage.Visibility = Visibility.Visible;
            }
            UpdatePreview();
        }
        else
        {
            SliderContainer.Visibility = Visibility.Collapsed;
            RestoreBrushCheckBox.Visibility = Visibility.Collapsed;
            BrushSizeContainer.Visibility = Visibility.Collapsed;
            BackgroundOriginalImage.Visibility = Visibility.Collapsed;
            PreviewImage.Source = ConvertBitmap(_rawCapture);
        }
    }

    private void RestoreBrushCheckBox_Changed(object sender, RoutedEventArgs e)
    {
        if (_isPreparing)
            return;

        bool isChecked = RestoreBrushCheckBox.IsChecked == true;
        BrushSizeContainer.Visibility = isChecked ? Visibility.Visible : Visibility.Collapsed;
        BackgroundOriginalImage.Visibility = isChecked ? Visibility.Visible : Visibility.Collapsed;

        if (isChecked && BackgroundOriginalImage.Source == null)
        {
            BackgroundOriginalImage.Source = ConvertBitmap(_rawCapture);
        }

        UpdatePreview();
    }

    private void BrushSizeSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (BrushSizeText != null)
        {
            BrushSizeText.Text = $"{(int)BrushSizeSlider.Value} px";
        }
    }

    private void PreviewImage_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        if (_isPreparing || RestoreBrushCheckBox.IsChecked == false || e.LeftButton != System.Windows.Input.MouseButtonState.Pressed)
            return;

        PreviewImage.CaptureMouse();
        PaintRestoreStroke(e.GetPosition(PreviewImage));
        UpdatePreview();
    }

    private void PreviewImage_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
    {
        if (!PreviewImage.IsMouseCaptured)
            return;

        PaintRestoreStroke(e.GetPosition(PreviewImage));
        UpdatePreview();
    }

    private void PreviewImage_MouseUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        if (PreviewImage.IsMouseCaptured)
        {
            PreviewImage.ReleaseMouseCapture();
        }
    }

    private void PaintRestoreStroke(System.Windows.Point mousePos)
    {
        double controlW = PreviewImage.ActualWidth;
        double controlH = PreviewImage.ActualHeight;
        if (controlW == 0 || controlH == 0 || _rawCapture == null || _manualRestoreMask == null)
            return;

        double imageW = _rawCapture.Width;
        double imageH = _rawCapture.Height;

        double ratioX = controlW / imageW;
        double ratioY = controlH / imageH;
        double scale = Math.Min(ratioX, ratioY);

        double viewW = imageW * scale;
        double viewH = imageH * scale;

        double offsetX = (controlW - viewW) / 2;
        double offsetY = (controlH - viewH) / 2;

        double imgX = (mousePos.X - offsetX) / scale;
        double imgY = (mousePos.Y - offsetY) / scale;

        int centerX = (int)Math.Round(imgX);
        int centerY = (int)Math.Round(imgY);

        int W = (int)imageW;
        int H = (int)imageH;
        int r = (int)BrushSizeSlider.Value;

        // Draw a circle of radius 'r' in the manual restore mask
        for (int dy = -r; dy <= r; dy++)
        {
            int py = centerY + dy;
            if (py < 0 || py >= H) continue;

            for (int dx = -r; dx <= r; dx++)
            {
                int px = centerX + dx;
                if (px < 0 || px >= W) continue;

                if (dx * dx + dy * dy <= r * r)
                {
                    _manualRestoreMask[py * W + px] = true;
                }
            }
        }
    }

    private void UpdatePreview()
    {
        if (_removalState == null)
            return;

        // Cancel any pending thresholding task to prevent UI lag when sliding fast
        _updateCts?.Cancel();
        _updateCts = new CancellationTokenSource();
        var token = _updateCts.Token;

        float thresholdValue = (float)ThresholdSlider.Value;

        Task.Run(() =>
        {
            try
            {
                // Run threshold, sigmoid, and alpha application
                Bitmap thresholded = _bgService.ApplyThreshold(_removalState, thresholdValue);

                // Overlay the red manual restore mask for visual feedback
                if (_manualRestoreMask != null && RestoreBrushCheckBox.Dispatcher.Invoke(() => RestoreBrushCheckBox.IsChecked == true))
                {
                    int w = thresholded.Width;
                    int h = thresholded.Height;
                    BitmapData bd = thresholded.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
                    BitmapData sd = _rawCapture.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);

                    unsafe
                    {
                        byte* d = (byte*)bd.Scan0;
                        byte* s = (byte*)sd.Scan0;
                        for (int i = 0; i < w * h; i++)
                        {
                            if (_manualRestoreMask[i])
                            {
                                int byteIdx = i * 4;
                                d[byteIdx + 0] = (byte)(s[byteIdx + 0] * 0.5f); // B
                                d[byteIdx + 1] = (byte)(s[byteIdx + 1] * 0.5f); // G
                                d[byteIdx + 2] = (byte)(s[byteIdx + 2] * 0.5f + 127.5f); // R (Red overlay blend)
                                d[byteIdx + 3] = 255; // Fully opaque alpha
                            }
                        }
                    }
                    thresholded.UnlockBits(bd);
                    _rawCapture.UnlockBits(sd);
                }

                if (token.IsCancellationRequested)
                {
                    thresholded.Dispose();
                    return;
                }

                Dispatcher.Invoke(() =>
                {
                    // Clean up the old preview bitmap to prevent memory leak
                    if (_processedBitmap != null && _processedBitmap != _rawCapture)
                    {
                        _processedBitmap.Dispose();
                    }

                    _processedBitmap = thresholded;
                    PreviewImage.Source = ConvertBitmap(_processedBitmap);
                });
            }
            catch
            {
                // Ignore task failures/cancellations
            }
        }, token);
    }

    private void OkayButton_Click(object sender, RoutedEventArgs e)
    {
        Bitmap finalBitmap;
        if (RemoveBgCheckBox.IsChecked == true && _removalState != null)
        {
            int w = _rawCapture.Width;
            int h = _rawCapture.Height;

            // Generate clean thresholded bitmap (without red tint)
            Bitmap cutout = _bgService.ApplyThreshold(_removalState, (float)ThresholdSlider.Value);
            
            // Build the final bitmap with manual restore overrides
            finalBitmap = new Bitmap(w, h, System.Drawing.Imaging.PixelFormat.Format32bppArgb);

            BitmapData cd = cutout.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            BitmapData fd = finalBitmap.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            BitmapData sd = _rawCapture.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);

            unsafe
            {
                byte* c = (byte*)cd.Scan0;
                byte* f = (byte*)fd.Scan0;
                byte* s = (byte*)sd.Scan0;

                for (int i = 0; i < w * h; i++)
                {
                    int bi = i * 4;
                    if (_manualRestoreMask != null && _manualRestoreMask[i])
                    {
                        f[bi + 0] = s[bi + 0]; // B
                        f[bi + 1] = s[bi + 1]; // G
                        f[bi + 2] = s[bi + 2]; // R
                        f[bi + 3] = 255;        // A
                    }
                    else
                    {
                        f[bi + 0] = c[bi + 0]; // B
                        f[bi + 1] = c[bi + 1]; // G
                        f[bi + 2] = c[bi + 2]; // R
                        f[bi + 3] = c[bi + 3]; // A
                    }
                }
            }

            cutout.UnlockBits(cd);
            finalBitmap.UnlockBits(fd);
            _rawCapture.UnlockBits(sd);
            cutout.Dispose();
        }
        else
        {
            finalBitmap = _rawCapture;
        }

        ClipboardService.CopyToClipboard(finalBitmap);

        if (finalBitmap != _rawCapture)
        {
            finalBitmap.Dispose();
        }

        DialogResult = true;
        Close();
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }

    private void Window_KeyDown(object sender, System.Windows.Input.KeyEventArgs e)
    {
        if (e.Key == System.Windows.Input.Key.Escape)
        {
            CancelButton_Click(sender, e);
        }
    }

    // Helper method to safely convert a GDI Bitmap to a WPF ImageSource without leaks
    private static ImageSource ConvertBitmap(Bitmap bitmap)
    {
        IntPtr hBitmap = bitmap.GetHbitmap();
        try
        {
            return Imaging.CreateBitmapSourceFromHBitmap(
                hBitmap,
                IntPtr.Zero,
                Int32Rect.Empty,
                BitmapSizeOptions.FromEmptyOptions());
        }
        finally
        {
            DeleteObject(hBitmap);
        }
    }

    protected override void OnClosed(EventArgs e)
    {
        base.OnClosed(e);

        // Cancel any pending async update
        _updateCts?.Cancel();

        // Clean up allocated GDI Bitmaps
        if (_processedBitmap != null && _processedBitmap != _rawCapture)
        {
            _processedBitmap.Dispose();
        }
    }
}
