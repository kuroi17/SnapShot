using System.Windows;
using System.Windows.Controls;   // Canvas, Canvas.SetLeft/SetTop
using System.Windows.Input;
using MouseEventArgs = System.Windows.Input.MouseEventArgs;
using KeyEventArgs   = System.Windows.Input.KeyEventArgs;
using SnapShot.Models;

namespace SnapShot;

/// <summary>
/// Fullscreen transparent overlay for selecting a screen region.
/// Shows a dark dim over the screen; user drags to define a capture region.
/// Fires RegionSelected when a valid region is confirmed, or Cancelled on ESC.
/// </summary>
public partial class CaptureOverlay : Window
{
    private System.Windows.Point _startPoint;
    private bool _isDragging;

    public event Action<CaptureRegion>? RegionSelected;
    public event Action? Cancelled;

    public CaptureOverlay()
    {
        InitializeComponent();
    }

    private void Canvas_MouseDown(object sender, MouseButtonEventArgs e)
    {
        if (e.LeftButton != MouseButtonState.Pressed) return;

        _startPoint = e.GetPosition(OverlayCanvas);
        _isDragging = true;

        HintPanel.Visibility = Visibility.Collapsed;
        SelectionRect.Visibility = Visibility.Visible;
        DimLabel.Visibility = Visibility.Visible;

        OverlayCanvas.CaptureMouse();

        UpdateSelectionRect(_startPoint, _startPoint);
    }

    private void Canvas_MouseMove(object sender, MouseEventArgs e)
    {
        if (!_isDragging) return;

        var current = e.GetPosition(OverlayCanvas);
        UpdateSelectionRect(_startPoint, current);
    }

    private void Canvas_MouseUp(object sender, MouseButtonEventArgs e)
    {
        if (!_isDragging) return;

        _isDragging = false;
        OverlayCanvas.ReleaseMouseCapture();

        var endPoint = e.GetPosition(OverlayCanvas);

        int x = (int)Math.Min(_startPoint.X, endPoint.X);
        int y = (int)Math.Min(_startPoint.Y, endPoint.Y);
        int w = (int)Math.Abs(endPoint.X - _startPoint.X);
        int h = (int)Math.Abs(endPoint.Y - _startPoint.Y);

        var region = new CaptureRegion(x, y, w, h);

        Close();

        if (region.IsValid)
            RegionSelected?.Invoke(region);
        // If too small — silently ignore (per PLAN.md edge case)
    }

    private void UpdateSelectionRect(System.Windows.Point a, System.Windows.Point b)
    {
        double x = Math.Min(a.X, b.X);
        double y = Math.Min(a.Y, b.Y);
        double w = Math.Abs(b.X - a.X);
        double h = Math.Abs(b.Y - a.Y);

        Canvas.SetLeft(SelectionRect, x);
        Canvas.SetTop(SelectionRect, y);
        SelectionRect.Width  = Math.Max(w, 1);
        SelectionRect.Height = Math.Max(h, 1);

        // Position dimension label just below-right of selection
        double labelX = x + w + 6;
        double labelY = y + h + 6;

        // Keep label on screen
        if (labelX + 80 > ActualWidth)  labelX = x - 90;
        if (labelY + 24 > ActualHeight) labelY = y - 28;

        Canvas.SetLeft(DimLabel, Math.Max(0, labelX));
        Canvas.SetTop(DimLabel,  Math.Max(0, labelY));

        DimText.Text = $"{(int)w} × {(int)h}";
    }

    private void Window_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Escape)
        {
            _isDragging = false;
            Close();
            Cancelled?.Invoke();
        }
    }
}
