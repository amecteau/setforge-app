use crate::models::settings::UserSettings;
use rusqlite::{Connection, Result};

pub fn save_settings(conn: &Connection, settings: &UserSettings) -> Result<()> {
    // Key-value upsert for each setting field
    let pairs: &[(&str, &str)] = &[
        ("font_scale", &settings.font_scale),
        ("weight_unit", &settings.weight_unit),
        (
            "last_exercise_id",
            settings.last_exercise_id.as_deref().unwrap_or(""),
        ),
    ];

    for (key, value) in pairs {
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [key, value],
        )?;
    }
    Ok(())
}

pub fn get_settings(conn: &Connection) -> Result<Option<UserSettings>> {
    let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
    let rows: Vec<(String, String)> = stmt
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
        .collect::<Result<_>>()?;

    if rows.is_empty() {
        return Ok(None);
    }

    let mut font_scale = "medium".to_string();
    let mut weight_unit = "lb".to_string();
    let mut last_exercise_id: Option<String> = None;

    for (key, value) in rows {
        match key.as_str() {
            "font_scale" => font_scale = value,
            "weight_unit" => weight_unit = value,
            "last_exercise_id" => {
                last_exercise_id = if value.is_empty() { None } else { Some(value) }
            }
            _ => {}
        }
    }

    Ok(Some(UserSettings { font_scale, weight_unit, last_exercise_id }))
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

    fn default_settings() -> UserSettings {
        UserSettings {
            font_scale: "medium".to_string(),
            weight_unit: "lb".to_string(),
            last_exercise_id: None,
        }
    }

    #[test]
    fn returns_none_when_no_settings_saved() {
        let conn = setup();
        let result = get_settings(&conn).expect("get");
        assert!(result.is_none());
    }

    #[test]
    fn save_and_retrieve_settings() {
        let conn = setup();
        let settings = UserSettings {
            font_scale: "large".to_string(),
            weight_unit: "kg".to_string(),
            last_exercise_id: Some("bench-press".to_string()),
        };
        save_settings(&conn, &settings).expect("save");
        let retrieved = get_settings(&conn).expect("get").expect("some");
        assert_eq!(retrieved.font_scale, "large");
        assert_eq!(retrieved.weight_unit, "kg");
        assert_eq!(retrieved.last_exercise_id, Some("bench-press".to_string()));
    }

    #[test]
    fn save_settings_overwrites_previous() {
        let conn = setup();
        save_settings(&conn, &default_settings()).expect("save 1");
        let updated = UserSettings {
            font_scale: "extraLarge".to_string(),
            weight_unit: "kg".to_string(),
            last_exercise_id: None,
        };
        save_settings(&conn, &updated).expect("save 2");
        let retrieved = get_settings(&conn).expect("get").expect("some");
        assert_eq!(retrieved.font_scale, "extraLarge");
        assert_eq!(retrieved.weight_unit, "kg");
    }

    #[test]
    fn last_exercise_id_none_roundtrips_correctly() {
        let conn = setup();
        let settings = UserSettings {
            font_scale: "medium".to_string(),
            weight_unit: "lb".to_string(),
            last_exercise_id: None,
        };
        save_settings(&conn, &settings).expect("save");
        let retrieved = get_settings(&conn).expect("get").expect("some");
        assert!(retrieved.last_exercise_id.is_none());
    }
}
