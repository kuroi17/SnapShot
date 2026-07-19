use image::RgbaImage;

pub fn copy_to_clipboard(_image: &RgbaImage) -> Result<(), Box<dyn std::error::Error>> {
    // Clipboard operations are handled via tauri-plugin-clipboard-manager
    // from the frontend side. This module provides the Rust-side interface.
    Ok(())
}
