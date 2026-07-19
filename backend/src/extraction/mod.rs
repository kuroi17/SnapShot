use image::RgbaImage;

pub fn remove_background(image: &RgbaImage) -> Result<RgbaImage, Box<dyn std::error::Error>> {
    // Placeholder: returns the original image with full opacity
    // Future: integrate background removal model here
    Ok(image.clone())
}
