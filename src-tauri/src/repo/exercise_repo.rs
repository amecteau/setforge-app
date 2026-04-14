use crate::models::exercise::Exercise;
use rusqlite::{Connection, Result};

pub fn save_custom_exercise(conn: &Connection, exercise: &Exercise) -> Result<()> {
    conn.execute(
        "INSERT INTO custom_exercises (id, name, muscle_group) VALUES (?1, ?2, ?3)",
        [&exercise.id, &exercise.name, &exercise.muscle_group],
    )?;
    Ok(())
}

pub fn get_custom_exercises(conn: &Connection) -> Result<Vec<Exercise>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, muscle_group FROM custom_exercises ORDER BY name ASC",
    )?;
    let exercises = stmt
        .query_map([], |row| {
            Ok(Exercise {
                id: row.get(0)?,
                name: row.get(1)?,
                muscle_group: row.get(2)?,
                is_custom: true,
            })
        })?
        .collect::<Result<_>>()?;
    Ok(exercises)
}

pub fn delete_custom_exercise(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM custom_exercises WHERE id = ?1", [id])?;
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

    fn make_exercise(id: &str, name: &str) -> Exercise {
        Exercise {
            id: id.to_string(),
            name: name.to_string(),
            muscle_group: "chest".to_string(),
            is_custom: true,
        }
    }

    #[test]
    fn save_and_retrieve_custom_exercise() {
        let conn = setup();
        let ex = make_exercise("ex1", "Cable Fly");
        save_custom_exercise(&conn, &ex).expect("save");
        let exercises = get_custom_exercises(&conn).expect("get");
        assert_eq!(exercises.len(), 1);
        assert_eq!(exercises[0].id, "ex1");
        assert_eq!(exercises[0].name, "Cable Fly");
        assert_eq!(exercises[0].muscle_group, "chest");
        assert!(exercises[0].is_custom);
    }

    #[test]
    fn delete_custom_exercise_removes_it() {
        let conn = setup();
        save_custom_exercise(&conn, &make_exercise("ex1", "Cable Fly")).expect("save");
        delete_custom_exercise(&conn, "ex1").expect("delete");
        let exercises = get_custom_exercises(&conn).expect("get");
        assert!(exercises.is_empty());
    }

    #[test]
    fn returns_empty_when_no_custom_exercises() {
        let conn = setup();
        let exercises = get_custom_exercises(&conn).expect("get");
        assert!(exercises.is_empty());
    }

    #[test]
    fn multiple_exercises_returned_alphabetically() {
        let conn = setup();
        save_custom_exercise(&conn, &make_exercise("ex2", "Zottman Curl")).expect("save");
        save_custom_exercise(&conn, &make_exercise("ex1", "Arnold Press")).expect("save");
        let exercises = get_custom_exercises(&conn).expect("get");
        assert_eq!(exercises[0].name, "Arnold Press");
        assert_eq!(exercises[1].name, "Zottman Curl");
    }
}
