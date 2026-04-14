use crate::models::settings::UserSettings;
use crate::repo::settings_repo;
use crate::DbConn;
use tauri::State;

#[tauri::command]
pub fn save_settings(db: State<DbConn>, settings: UserSettings) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    settings_repo::save_settings(&conn, &settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_settings(db: State<DbConn>) -> Result<Option<UserSettings>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    settings_repo::get_settings(&conn).map_err(|e| e.to_string())
}
