pub mod audio;
pub mod commands;
pub mod db;
pub mod fs_lazy;
pub mod models;
pub mod mpris;

use audio::AudioEngineHandle;
use commands::AppState;
use db::DatabaseManager;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let audio_engine = Arc::new(AudioEngineHandle::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup({
            let audio_engine = Arc::clone(&audio_engine);
            move |app| {
                // Initialize MPRIS D-Bus player on GTK main thread
                mpris::start_mpris_service(Arc::clone(&audio_engine));

                // Initialize SQLite database in user's app data directory or fallback to current dir
                let app_data_dir = app
                    .path()
                    .app_data_dir()
                    .unwrap_or_else(|_| PathBuf::from("."));
                let _ = std::fs::create_dir_all(&app_data_dir);
                let db_path = app_data_dir.join("musicx_library.db");

                let db = DatabaseManager::new(db_path)
                    .expect("Failed to initialize SQLite database for musicx");
                let db = Arc::new(db);

                app.manage(AppState {
                    audio: audio_engine,
                    db,
                });

                Ok(())
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_audio_engine_status,
            commands::get_telemetry,
            commands::play_track,
            commands::pause_track,
            commands::resume_track,
            commands::stop_track,
            commands::seek_track,
            commands::set_volume,
            commands::set_output_device,
            commands::list_audio_devices,
            commands::get_library_tracks,
            commands::scan_directory,
            commands::read_directory_lazy,
        ])
        .run(tauri::generate_context!())
        .expect("error while running musicx audio player application");
}
