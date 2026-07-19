use image::{RgbaImage, ImageBuffer};

pub fn capture_region(x: i32, y: i32, width: i32, height: i32) -> Result<RgbaImage, Box<dyn std::error::Error>> {
    let width = width.max(1) as u32;
    let height = height.max(1) as u32;

    let screens = screenshots::Screen::all();
    let screen = screens.into_iter().next()
        .ok_or_else::<Box<dyn std::error::Error>, _>(|| "No screen found".into())?;

    let img = screen.capture()
        .ok_or_else::<Box<dyn std::error::Error>, _>(|| "Failed to capture screen".into())?;

    let raw = image::load_from_memory(img.buffer())?.to_rgba8();

    let cropped: RgbaImage = ImageBuffer::from_fn(width, height, |px, py| {
        let sx = (x as u32).saturating_add(px).min(raw.width().saturating_sub(1));
        let sy = (y as u32).saturating_add(py).min(raw.height().saturating_sub(1));
        *raw.get_pixel(sx, sy)
    });

    Ok(cropped)
}
