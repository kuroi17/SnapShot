mod capture;
mod clipboard;
mod extraction;
mod hotkey;

use capture::capture_region;
use clipboard::copy_to_clipboard;
use extraction::remove_background;

#[tauri::command]
async fn capture_screen(x: i32, y: i32, width: i32, height: i32) -> Result<String, String> {
    let image_data = capture_region(x, y, width, height).map_err(|e| e.to_string())?;
    let transparent = remove_background(&image_data).map_err(|e| e.to_string())?;
    copy_to_clipboard(&transparent).map_err(|e| e.to_string())?;
    Ok("Image captured and copied to clipboard".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![capture_screen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
