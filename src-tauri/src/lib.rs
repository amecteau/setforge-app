pub mod commands;
pub mod db;
pub mod models;
pub mod repo;

use std::sync::Mutex;
use rusqlite::Connection;

/// Shared database connection wrapped in a Mutex for thread-safe access from commands.
pub struct DbConn(pub Mutex<Connection>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Open (or create) the SQLite database in the app data directory
            use tauri::Manager;
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let db_path = data_dir.join("repcounter.db");
            let conn = Connection::open(&db_path)?;
            db::initialize_db(&conn)?;
            app.manage(DbConn(Mutex::new(conn)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::workout::start_workout,
            commands::workout::finish_workout,
            commands::workout::save_set,
            commands::workout::get_workouts,
            commands::workout::get_incomplete_workout,
            commands::workout::delete_workout,
            commands::exercise::save_custom_exercise,
            commands::exercise::get_custom_exercises,
            commands::exercise::delete_custom_exercise,
            commands::settings::save_settings,
            commands::settings::get_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
