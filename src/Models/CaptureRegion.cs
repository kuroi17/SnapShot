namespace SnapShot.Models;

/// <summary>
/// Represents the coordinates and dimensions of a captured screen region.
/// All values are in logical (DPI-aware) pixels.
/// </summary>
public readonly record struct CaptureRegion(int X, int Y, int Width, int Height)
{
    public bool IsValid => Width >= 10 && Height >= 10;
}
