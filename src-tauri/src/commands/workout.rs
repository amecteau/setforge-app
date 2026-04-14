use crate::models::workout::{Workout, WorkoutSet};
use crate::repo::workout_repo;
use crate::DbConn;
use tauri::State;

#[tauri::command]
pub fn start_workout(db: State<DbConn>, id: String, date: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workout_repo::save_workout(&conn, &id, &date).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn finish_workout(
    db: State<DbConn>,
    id: String,
    duration_minutes: i64,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workout_repo::finish_workout(&conn, &id, duration_minutes).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_set(
    db: State<DbConn>,
    workout_id: String,
    set: WorkoutSet,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workout_repo::save_set(&conn, &workout_id, &set).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_workouts(db: State<DbConn>) -> Result<Vec<Workout>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workout_repo::get_workouts(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_incomplete_workout(db: State<DbConn>) -> Result<Option<Workout>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workout_repo::get_incomplete_workout(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_workout(db: State<DbConn>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workout_repo::delete_workout(&conn, &id).map_err(|e| e.to_string())
}
