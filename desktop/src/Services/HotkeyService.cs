using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;

namespace SnapShot.Services;

/// <summary>
/// Registers a system-wide global hotkey using Win32 RegisterHotKey.
/// Fires the HotkeyPressed event when the registered combination is detected.
/// </summary>
public sealed class HotkeyService : IDisposable
{
    private const int WM_HOTKEY = 0x0312;
    private const int HOTKEY_ID = 9000;

    // Modifier flags
    private const uint MOD_CONTROL = 0x0002;
    private const uint MOD_SHIFT   = 0x0004;
    private const uint MOD_NOREPEAT = 0x4000;

    // Virtual key: S
    private const uint VK_S = 0x53;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    private HwndSource? _source;
    private IntPtr _hwnd;

    public event Action? HotkeyPressed;

    /// <summary>
    /// Registers Ctrl+Shift+S globally. Must be called after the main window handle is available.
    /// </summary>
    public void Register(Window owner)
    {
        _hwnd = new WindowInteropHelper(owner).Handle;
        _source = HwndSource.FromHwnd(_hwnd);
        _source.AddHook(WndProc);

        bool ok = RegisterHotKey(_hwnd, HOTKEY_ID, MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT, VK_S);
        if (!ok)
        {
            int err = Marshal.GetLastWin32Error();
            throw new InvalidOperationException(
                $"Failed to register hotkey Ctrl+Shift+S. Win32 error: {err}. " +
                "Another application may already be using this hotkey.");
        }
    }

    private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == WM_HOTKEY && wParam.ToInt32() == HOTKEY_ID)
        {
            HotkeyPressed?.Invoke();
            handled = true;
        }
        return IntPtr.Zero;
    }

    public void Dispose()
    {
        if (_hwnd != IntPtr.Zero)
            UnregisterHotKey(_hwnd, HOTKEY_ID);

        _source?.RemoveHook(WndProc);
        _source?.Dispose();
    }
}
