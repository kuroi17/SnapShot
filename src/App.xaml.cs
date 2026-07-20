using System.Drawing;
using System.IO;
using System.Windows;
using System.Windows.Threading;
using SnapShot.Services;
using WinForms = System.Windows.Forms;

namespace SnapShot;

/// <summary>
/// Application entry point.
/// Creates the system tray icon, registers the global hotkey,
/// and orchestrates the capture → remove background → clipboard pipeline.
/// </summary>
public partial class App : Application
{
    private WinForms.NotifyIcon? _trayIcon;
    private HotkeyService? _hotkeyService;
    private BackgroundRemovalService? _bgRemoval;

    // Invisible helper window used to host the Win32 message loop for hotkeys
    private Window? _helperWindow;

    private bool _isCapturing = false;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // Load ONNX model — look next to the executable first
        string modelPath = FindModelPath("u2netp.onnx");
        _bgRemoval = new BackgroundRemovalService(modelPath);

        SetupTrayIcon();
        SetupHotkey();
    }

    private static string FindModelPath(string filename)
    {
        string exeDir = AppContext.BaseDirectory;
        string path1  = Path.Combine(exeDir, "Assets", filename);
        if (File.Exists(path1)) return path1;

        string path2 = Path.Combine(exeDir, filename);
        if (File.Exists(path2)) return path2;

        throw new FileNotFoundException(
            $"ONNX model '{filename}' not found. Expected at: {path1}");
    }

    private void SetupTrayIcon()
    {
        string iconPath = Path.Combine(AppContext.BaseDirectory, "Assets", "icon.ico");

        _trayIcon = new WinForms.NotifyIcon
        {
            Text    = "SnapShot — Ctrl+Shift+S to capture",
            Visible = true,
            Icon    = File.Exists(iconPath)
                        ? new System.Drawing.Icon(iconPath)
                        : System.Drawing.SystemIcons.Application,
        };

        var menu = new WinForms.ContextMenuStrip();

        var captureItem = new WinForms.ToolStripMenuItem("Capture (Ctrl+Shift+S)");
        captureItem.Click += (_, _) => BeginCapture();
        menu.Items.Add(captureItem);

        menu.Items.Add(new WinForms.ToolStripSeparator());

        var quitItem = new WinForms.ToolStripMenuItem("Quit");
        quitItem.Click += (_, _) => Shutdown();
        menu.Items.Add(quitItem);

        _trayIcon.ContextMenuStrip = menu;
        _trayIcon.DoubleClick += (_, _) => BeginCapture();
    }

    private void SetupHotkey()
    {
        // Invisible 0×0 window to host the HwndSource for Win32 messages
        _helperWindow = new Window
        {
            Width         = 0,
            Height        = 0,
            WindowStyle   = WindowStyle.None,
            ShowInTaskbar = false,
            Opacity       = 0,
        };
        _helperWindow.Show();
        _helperWindow.Hide();

        _hotkeyService = new HotkeyService();
        try
        {
            _hotkeyService.Register(_helperWindow);
            _hotkeyService.HotkeyPressed += BeginCapture;
        }
        catch (InvalidOperationException ex)
        {
            ShowTrayNotification("Hotkey conflict", ex.Message, WinForms.ToolTipIcon.Warning);
        }
    }

    private void BeginCapture()
    {
        if (_isCapturing) return;
        _isCapturing = true;

        // Must show overlay on the UI thread
        Dispatcher.Invoke(() =>
        {
            var overlay = new CaptureOverlay();
            overlay.RegionSelected += OnRegionSelected;
            overlay.Cancelled      += () => _isCapturing = false;
            overlay.Show();
        });
    }

    private void OnRegionSelected(Models.CaptureRegion region)
    {
        _isCapturing = false;

        Task.Run(() =>
        {
            try
            {
                // 1. Capture screen region
                using System.Drawing.Bitmap captured = ScreenCaptureService.Capture(region);

                // 2. Remove background
                using System.Drawing.Bitmap transparent = _bgRemoval!.RemoveBackground(captured);

                // 3. Copy to clipboard — must be on STA/UI thread
                Dispatcher.Invoke(() =>
                {
                    ClipboardService.CopyToClipboard(transparent);
                    ShowTrayNotification("SnapShot",
                        "Transparent image copied to clipboard ✓",
                        WinForms.ToolTipIcon.Info);
                });
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() =>
                    ShowTrayNotification("SnapShot — Error", ex.Message, WinForms.ToolTipIcon.Error));
            }
        });
    }

    private void ShowTrayNotification(string title, string message, WinForms.ToolTipIcon icon)
    {
        _trayIcon?.ShowBalloonTip(3000, title, message, icon);
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _hotkeyService?.Dispose();
        _bgRemoval?.Dispose();

        if (_trayIcon != null)
        {
            _trayIcon.Visible = false;
            _trayIcon.Dispose();
        }

        base.OnExit(e);
    }
}
