use crate::models::workout::{Workout, WorkoutSet};
use rusqlite::{Connection, Result};
use std::collections::HashMap;

pub fn save_workout(conn: &Connection, id: &str, date: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO workouts (id, date, duration_minutes) VALUES (?1, ?2, NULL)",
        [id, date],
    )?;
    Ok(())
}

pub fn finish_workout(conn: &Connection, id: &str, duration_minutes: i64) -> Result<()> {
    conn.execute(
        "UPDATE workouts SET duration_minutes = ?1 WHERE id = ?2",
        rusqlite::params![duration_minutes, id],
    )?;
    Ok(())
}

pub fn save_set(conn: &Connection, workout_id: &str, set: &WorkoutSet) -> Result<()> {
    conn.execute(
        "INSERT INTO sets (id, workout_id, exercise_id, reps, weight, unit, timestamp, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            set.id,
            workout_id,
            set.exercise_id,
            set.reps,
            set.weight,
            set.unit,
            set.timestamp,
            set.notes,
        ],
    )?;
    Ok(())
}

pub fn get_workouts(conn: &Connection) -> Result<Vec<Workout>> {
    // Fetch all workouts ordered newest first
    let mut w_stmt = conn.prepare(
        "SELECT id, date, duration_minutes FROM workouts ORDER BY date DESC",
    )?;
    let workout_rows: Vec<(String, String, Option<i64>)> = w_stmt
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))?
        .collect::<Result<_>>()?;

    if workout_rows.is_empty() {
        return Ok(vec![]);
    }

    // Fetch all sets in one query
    let mut s_stmt = conn.prepare(
        "SELECT id, workout_id, exercise_id, reps, weight, unit, timestamp, notes
         FROM sets ORDER BY timestamp ASC",
    )?;
    let set_pairs: Vec<(String, WorkoutSet)> = s_stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(1)?, // workout_id
                WorkoutSet {
                    id: row.get(0)?,
                    exercise_id: row.get(2)?,
                    reps: row.get(3)?,
                    weight: row.get(4)?,
                    unit: row.get(5)?,
                    timestamp: row.get(6)?,
                    notes: row.get(7)?,
                },
            ))
        })?
        .collect::<Result<_>>()?;

    // Group sets by workout_id
    let mut sets_map: HashMap<String, Vec<WorkoutSet>> = HashMap::new();
    for (wid, set) in set_pairs {
        sets_map.entry(wid).or_default().push(set);
    }

    let workouts = workout_rows
        .into_iter()
        .map(|(id, date, duration_minutes)| {
            let sets = sets_map.remove(&id).unwrap_or_default();
            Workout { id, date, sets, duration_minutes }
        })
        .collect();

    Ok(workouts)
}

/// Returns the most recent workout that has not been finished (duration_minutes IS NULL).
pub fn get_incomplete_workout(conn: &Connection) -> Result<Option<Workout>> {
    let result = conn.query_row(
        "SELECT id, date FROM workouts WHERE duration_minutes IS NULL ORDER BY date DESC LIMIT 1",
        [],
        |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
    );

    match result {
        Ok((id, date)) => {
            let mut s_stmt = conn.prepare(
                "SELECT id, exercise_id, reps, weight, unit, timestamp, notes
                 FROM sets WHERE workout_id = ?1 ORDER BY timestamp ASC",
            )?;
            let sets: Vec<WorkoutSet> = s_stmt
                .query_map([&id], |row| {
                    Ok(WorkoutSet {
                        id: row.get(0)?,
                        exercise_id: row.get(1)?,
                        reps: row.get(2)?,
                        weight: row.get(3)?,
                        unit: row.get(4)?,
                        timestamp: row.get(5)?,
                        notes: row.get(6)?,
                    })
                })?
                .collect::<Result<_>>()?;
            Ok(Some(Workout { id, date, sets, duration_minutes: None }))
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

pub fn delete_workout(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM sets WHERE workout_id = ?1", [id])?;
    conn.execute("DELETE FROM workouts WHERE id = ?1", [id])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::initialize_db;

    fn setup() -> Connection {
        let conn = Connection::open_in_memory().expect("in-memory db");
        initialize_db(&conn).expect("schema");
        conn
    }

    fn make_set(id: &str, exercise_id: &str) -> WorkoutSet {
        WorkoutSet {
            id: id.to_string(),
            exercise_id: exercise_id.to_string(),
            reps: 10,
            weight: Some(100.0),
            unit: "lb".to_string(),
            timestamp: "2026-04-10T10:00:00Z".to_string(),
            notes: String::new(),
        }
    }

    #[test]
    fn save_and_retrieve_workout() {
        let conn = setup();
        save_workout(&conn, "w1", "2026-04-10").expect("save workout");
        let workouts = get_workouts(&conn).expect("get workouts");
        assert_eq!(workouts.len(), 1);
        assert_eq!(workouts[0].id, "w1");
        assert_eq!(workouts[0].date, "2026-04-10");
        assert!(workouts[0].duration_minutes.is_none());
        assert!(workouts[0].sets.is_empty());
    }

    #[test]
    fn save_set_associates_with_workout() {
        let conn = setup();
        save_workout(&conn, "w1", "2026-04-10").expect("save workout");
        let set = make_set("s1", "bench-press");
        save_set(&conn, "w1", &set).expect("save set");
        let workouts = get_workouts(&conn).expect("get workouts");
        assert_eq!(workouts[0].sets.len(), 1);
        assert_eq!(workouts[0].sets[0].reps, 10);
        assert_eq!(workouts[0].sets[0].exercise_id, "bench-press");
    }

    #[test]
    fn finish_workout_sets_duration() {
        let conn = setup();
        save_workout(&conn, "w1", "2026-04-10").expect("save workout");
        finish_workout(&conn, "w1", 45).expect("finish workout");
        let workouts = get_workouts(&conn).expect("get workouts");
        assert_eq!(workouts[0].duration_minutes, Some(45));
    }

    #[test]
    fn get_incomplete_workout_returns_unfinished() {
        let conn = setup();
        save_workout(&conn, "w1", "2026-04-10").expect("save workout");
        let incomplete = get_incomplete_workout(&conn).expect("query");
        assert!(incomplete.is_some());
        assert_eq!(incomplete.unwrap().id, "w1");
    }

    #[test]
    fn get_incomplete_workout_returns_none_when_finished() {
        let conn = setup();
        save_workout(&conn, "w1", "2026-04-10").expect("save workout");
        finish_workout(&conn, "w1", 30).expect("finish");
        let incomplete = get_incomplete_workout(&conn).expect("query");
        assert!(incomplete.is_none());
    }

    #[test]
    fn delete_workout_removes_workout_and_sets() {
        let conn = setup();
        save_workout(&conn, "w1", "2026-04-10").expect("save workout");
        save_set(&conn, "w1", &make_set("s1", "squat")).expect("save set");
        delete_workout(&conn, "w1").expect("delete");
        let workouts = get_workouts(&conn).expect("get workouts");
        assert!(workouts.is_empty());
        let set_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM sets", [], |r| r.get(0))
            .expect("count");
        assert_eq!(set_count, 0);
    }

    #[test]
    fn multiple_sets_preserved_in_order() {
        let conn = setup();
        save_workout(&conn, "w1", "2026-04-10").expect("save workout");
        let mut s1 = make_set("s1", "bench-press");
        s1.timestamp = "2026-04-10T10:00:00Z".to_string();
        let mut s2 = make_set("s2", "bench-press");
        s2.timestamp = "2026-04-10T10:05:00Z".to_string();
        s2.reps = 8;
        save_set(&conn, "w1", &s1).expect("save s1");
        save_set(&conn, "w1", &s2).expect("save s2");
        let workouts = get_workouts(&conn).expect("get");
        assert_eq!(workouts[0].sets.len(), 2);
        assert_eq!(workouts[0].sets[0].reps, 10);
        assert_eq!(workouts[0].sets[1].reps, 8);
    }
}
