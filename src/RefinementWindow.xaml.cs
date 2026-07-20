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
    private byte[]? _manualMaskOverrides;

    private readonly System.Collections.Generic.Stack<byte[]> _undoStack = new();
    private readonly System.Collections.Generic.Stack<byte[]> _redoStack = new();

    // Zoom & Pan state variables
    private double _zoomLevel = 1.0;
    private bool _isSpacePressed = false;
    private bool _isPanning = false;
    private double _startScrollX;
    private double _startScrollY;
    private System.Windows.Point _startMousePos;

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
        RemoveBrushCheckBox.IsEnabled = false;

        try
        {
            // Run u2netp and guided filter on a background thread
            _removalState = await Task.Run(() => _bgService.Prepare(_rawCapture));
            _manualMaskOverrides = new byte[_rawCapture.Width * _rawCapture.Height];
            _isPreparing = false;
            
            ThresholdSlider.IsEnabled = true;
            RemoveBgCheckBox.IsEnabled = true;
            RestoreBrushCheckBox.IsEnabled = true;
            RemoveBrushCheckBox.IsEnabled = true;

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
            RemoveBrushCheckBox.Visibility = Visibility.Visible;
            SyncBrushUI();
        }
        else
        {
            SliderContainer.Visibility = Visibility.Collapsed;
            RestoreBrushCheckBox.Visibility = Visibility.Collapsed;
            RemoveBrushCheckBox.Visibility = Visibility.Collapsed;
            BrushSizeContainer.Visibility = Visibility.Collapsed;
            BackgroundOriginalImage.Visibility = Visibility.Collapsed;
            PreviewImage.Source = ConvertBitmap(_rawCapture);
        }
    }

    private void RestoreBrushCheckBox_Changed(object sender, RoutedEventArgs e)
    {
        if (_isPreparing) return;

        if (RestoreBrushCheckBox.IsChecked == true)
        {
            RemoveBrushCheckBox.IsChecked = false;
        }
        SyncBrushUI();
    }

    private void RemoveBrushCheckBox_Changed(object sender, RoutedEventArgs e)
    {
        if (_isPreparing) return;

        if (RemoveBrushCheckBox.IsChecked == true)
        {
            RestoreBrushCheckBox.IsChecked = false;
        }
        SyncBrushUI();
    }

    private void SyncBrushUI()
    {
        bool restoreChecked = RestoreBrushCheckBox.IsChecked == true;
        bool removeChecked = RemoveBrushCheckBox.IsChecked == true;
        bool anyChecked = restoreChecked || removeChecked;

        BrushSizeContainer.Visibility = anyChecked ? Visibility.Visible : Visibility.Collapsed;
        BackgroundOriginalImage.Visibility = anyChecked ? Visibility.Visible : Visibility.Collapsed;

        if (anyChecked && BackgroundOriginalImage.Source == null)
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
        if (_isPreparing || e.LeftButton != System.Windows.Input.MouseButtonState.Pressed || _isSpacePressed)
            return;

        bool isRestore = RestoreBrushCheckBox.IsChecked == true;
        bool isRemove = RemoveBrushCheckBox.IsChecked == true;
        if (!isRestore && !isRemove)
            return;

        // Save state to Undo stack before drawing begins
        PushUndo();

        PreviewImage.CaptureMouse();
        PaintRestoreStroke(e.GetPosition(PreviewImage));
    }

    private void PreviewImage_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
    {
        if (!PreviewImage.IsMouseCaptured)
            return;

        PaintRestoreStroke(e.GetPosition(PreviewImage));
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
        if (controlW == 0 || controlH == 0 || _rawCapture == null || _manualMaskOverrides == null || _processedBitmap == null)
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
        byte brushMode = RestoreBrushCheckBox.IsChecked == true ? (byte)1 : (byte)2;

        bool changed = false;

        // Draw a circle of radius 'r' in the manual mask overrides
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
                    int idx = py * W + px;
                    if (_manualMaskOverrides[idx] != brushMode)
                    {
                        _manualMaskOverrides[idx] = brushMode;
                        changed = true;
                    }
                }
            }
        }

        if (changed)
        {
            // Directly write to the displayed preview bitmap buffer for instant, lag-free painting!
            BitmapData pd = _processedBitmap.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadWrite, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            BitmapData sd = _rawCapture.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);

            unsafe
            {
                byte* p = (byte*)pd.Scan0;
                byte* s = (byte*)sd.Scan0;

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
                            int i = py * W + px;
                            int bi = i * 4;
                            if (brushMode == 1) // Restore original pixels
                            {
                                p[bi + 0] = s[bi + 0]; // B
                                p[bi + 1] = s[bi + 1]; // G
                                p[bi + 2] = s[bi + 2]; // R
                                p[bi + 3] = 255;        // A
                            }
                            else // Remove pixels
                            {
                                p[bi + 0] = 0; // B
                                p[bi + 1] = 0; // G
                                p[bi + 2] = 0; // R
                                p[bi + 3] = 0; // A
                            }
                        }
                    }
                }
            }

            _processedBitmap.UnlockBits(pd);
            _rawCapture.UnlockBits(sd);

            // Instantly render on the UI thread
            PreviewImage.Source = ConvertBitmap(_processedBitmap);
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

                // Overlay the manual restore/remove mask overrides
                if (_manualMaskOverrides != null && (RestoreBrushCheckBox.Dispatcher.Invoke(() => RestoreBrushCheckBox.IsChecked == true || RemoveBrushCheckBox.IsChecked == true)))
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
                            byte mode = _manualMaskOverrides[i];
                            if (mode == 1) // Restore
                            {
                                int byteIdx = i * 4;
                                d[byteIdx + 0] = s[byteIdx + 0]; // B
                                d[byteIdx + 1] = s[byteIdx + 1]; // G
                                d[byteIdx + 2] = s[byteIdx + 2]; // R
                                d[byteIdx + 3] = 255;            // A
                            }
                            else if (mode == 2) // Remove
                            {
                                int byteIdx = i * 4;
                                d[byteIdx + 0] = 0;
                                d[byteIdx + 1] = 0;
                                d[byteIdx + 2] = 0;
                                d[byteIdx + 3] = 0;
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
        if (RemoveBgCheckBox.IsChecked == true && _processedBitmap != null)
        {
            // _processedBitmap contains the final correct cutout with all threshold and brush modifications.
            // Clone it to copy to clipboard safely (avoiding dispose race conditions).
            finalBitmap = (Bitmap)_processedBitmap.Clone();
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

    // ── Undo / Redo Operations ──────────────────────────────────────────────

    private void PushUndo()
    {
        if (_manualMaskOverrides == null) return;
        byte[] copy = new byte[_manualMaskOverrides.Length];
        Array.Copy(_manualMaskOverrides, copy, _manualMaskOverrides.Length);
        _undoStack.Push(copy);
        _redoStack.Clear();
        UpdateUndoRedoButtons();
    }

    private void UpdateUndoRedoButtons()
    {
        UndoButton.IsEnabled = _undoStack.Count > 0;
        RedoButton.IsEnabled = _redoStack.Count > 0;
    }

    private void PerformUndo()
    {
        if (_undoStack.Count == 0 || _manualMaskOverrides == null) return;

        byte[] redoCopy = new byte[_manualMaskOverrides.Length];
        Array.Copy(_manualMaskOverrides, redoCopy, _manualMaskOverrides.Length);
        _redoStack.Push(redoCopy);

        _manualMaskOverrides = _undoStack.Pop();
        UpdateUndoRedoButtons();
        UpdatePreview();
    }

    private void PerformRedo()
    {
        if (_redoStack.Count == 0 || _manualMaskOverrides == null) return;

        byte[] undoCopy = new byte[_manualMaskOverrides.Length];
        Array.Copy(_manualMaskOverrides, undoCopy, _manualMaskOverrides.Length);
        _undoStack.Push(undoCopy);

        _manualMaskOverrides = _redoStack.Pop();
        UpdateUndoRedoButtons();
        UpdatePreview();
    }

    private void UndoButton_Click(object sender, RoutedEventArgs e) => PerformUndo();
    private void RedoButton_Click(object sender, RoutedEventArgs e) => PerformRedo();

    private void Window_KeyDown(object sender, System.Windows.Input.KeyEventArgs e)
    {
        if (e.Key == System.Windows.Input.Key.Escape)
        {
            CancelButton_Click(sender, e);
        }
        else if (e.Key == System.Windows.Input.Key.Z && (System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Control) == System.Windows.Input.ModifierKeys.Control)
        {
            PerformUndo();
            e.Handled = true;
        }
        else if (e.Key == System.Windows.Input.Key.Y && (System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Control) == System.Windows.Input.ModifierKeys.Control)
        {
            PerformRedo();
            e.Handled = true;
        }
        else if (e.Key == System.Windows.Input.Key.OemPlus || e.Key == System.Windows.Input.Key.Add)
        {
            if ((System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Control) == System.Windows.Input.ModifierKeys.Control)
            {
                ZoomIn();
                e.Handled = true;
            }
        }
        else if (e.Key == System.Windows.Input.Key.OemMinus || e.Key == System.Windows.Input.Key.Subtract)
        {
            if ((System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Control) == System.Windows.Input.ModifierKeys.Control)
            {
                ZoomOut();
                e.Handled = true;
            }
        }
        else if (e.Key == System.Windows.Input.Key.Space && !e.IsRepeat)
        {
            _isSpacePressed = true;
            this.Cursor = System.Windows.Input.Cursors.Hand;
            e.Handled = true;
        }
        else if (e.Key == System.Windows.Input.Key.Left)
        {
            ImageScrollViewer.LineLeft();
            e.Handled = true;
        }
        else if (e.Key == System.Windows.Input.Key.Right)
        {
            ImageScrollViewer.LineRight();
            e.Handled = true;
        }
        else if (e.Key == System.Windows.Input.Key.Up)
        {
            ImageScrollViewer.LineUp();
            e.Handled = true;
        }
        else if (e.Key == System.Windows.Input.Key.Down)
        {
            ImageScrollViewer.LineDown();
            e.Handled = true;
        }
    }

    private void Window_KeyUp(object sender, System.Windows.Input.KeyEventArgs e)
    {
        if (e.Key == System.Windows.Input.Key.Space)
        {
            _isSpacePressed = false;
            _isPanning = false;
            if (ImageScrollViewer.IsMouseCaptured)
            {
                ImageScrollViewer.ReleaseMouseCapture();
            }
            this.Cursor = System.Windows.Input.Cursors.Arrow;
            e.Handled = true;
        }
    }

    private void ZoomIn()
    {
        _zoomLevel = Math.Min(_zoomLevel + 0.15, 4.0); // max 400%
        ImageScaleTransform.ScaleX = _zoomLevel;
        ImageScaleTransform.ScaleY = _zoomLevel;
    }

    private void ZoomOut()
    {
        _zoomLevel = Math.Max(_zoomLevel - 0.15, 0.5); // min 50%
        ImageScaleTransform.ScaleX = _zoomLevel;
        ImageScaleTransform.ScaleY = _zoomLevel;
    }

    private void ImageScrollViewer_PreviewMouseWheel(object sender, System.Windows.Input.MouseWheelEventArgs e)
    {
        if ((System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Control) == System.Windows.Input.ModifierKeys.Control)
        {
            if (e.Delta > 0) ZoomIn();
            else ZoomOut();
            e.Handled = true;
        }
        else if ((System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Shift) == System.Windows.Input.ModifierKeys.Shift)
        {
            if (e.Delta > 0) ImageScrollViewer.LineLeft();
            else ImageScrollViewer.LineRight();
            e.Handled = true;
        }
    }

    private void ImageScrollViewer_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        bool isMiddleClick = e.ChangedButton == System.Windows.Input.MouseButton.Middle;
        bool isSpaceLeftClick = e.ChangedButton == System.Windows.Input.MouseButton.Left && _isSpacePressed;

        if (isMiddleClick || isSpaceLeftClick)
        {
            _isPanning = true;
            _startScrollX = ImageScrollViewer.HorizontalOffset;
            _startScrollY = ImageScrollViewer.VerticalOffset;
            _startMousePos = e.GetPosition(ImageScrollViewer);
            ImageScrollViewer.CaptureMouse();
            e.Handled = true;
        }
    }

    private void ImageScrollViewer_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
    {
        if (_isPanning && ImageScrollViewer.IsMouseCaptured)
        {
            var currentPos = e.GetPosition(ImageScrollViewer);
            double dx = currentPos.X - _startMousePos.X;
            double dy = currentPos.Y - _startMousePos.Y;
            ImageScrollViewer.ScrollToHorizontalOffset(_startScrollX - dx);
            ImageScrollViewer.ScrollToVerticalOffset(_startScrollY - dy);
            e.Handled = true;
        }
    }

    private void ImageScrollViewer_MouseUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        if (_isPanning)
        {
            _isPanning = false;
            ImageScrollViewer.ReleaseMouseCapture();
            e.Handled = true;
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
