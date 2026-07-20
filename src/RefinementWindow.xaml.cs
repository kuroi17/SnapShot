using System;
using System.Drawing;
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

        try
        {
            // Run u2netp and guided filter on a background thread
            _removalState = await Task.Run(() => _bgService.Prepare(_rawCapture));
            _isPreparing = false;
            ThresholdSlider.IsEnabled = true;
            RemoveBgCheckBox.IsEnabled = true;

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
            UpdatePreview();
        }
        else
        {
            SliderContainer.Visibility = Visibility.Collapsed;
            PreviewImage.Source = ConvertBitmap(_rawCapture);
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
        // 1. Copy the appropriate image to the clipboard
        if (RemoveBgCheckBox.IsChecked == true && _processedBitmap != null)
        {
            ClipboardService.CopyToClipboard(_processedBitmap);
        }
        else
        {
            ClipboardService.CopyToClipboard(_rawCapture);
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
