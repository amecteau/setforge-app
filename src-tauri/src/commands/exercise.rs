use crate::models::exercise::Exercise;
use crate::repo::exercise_repo;
use crate::DbConn;
use tauri::State;

#[tauri::command]
pub fn save_custom_exercise(db: State<DbConn>, exercise: Exercise) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    exercise_repo::save_custom_exercise(&conn, &exercise).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_custom_exercises(db: State<DbConn>) -> Result<Vec<Exercise>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    exercise_repo::get_custom_exercises(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_custom_exercise(db: State<DbConn>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    exercise_repo::delete_custom_exercise(&conn, &id).map_err(|e| e.to_string())
}
