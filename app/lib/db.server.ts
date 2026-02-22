import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "data/suggestions.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        facebook_url TEXT NOT NULL,
        facebook_id TEXT,
        name TEXT NOT NULL,
        profile_picture TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Migrations: add columns if they don't exist yet
    try { db.exec(`ALTER TABLE suggestions ADD COLUMN rating INTEGER`); } catch {}
    try { db.exec(`ALTER TABLE suggestions ADD COLUMN tags TEXT`); } catch {}
  }
  return db;
}

export interface Suggestion {
  id: number;
  facebook_url: string;
  facebook_id: string | null;
  name: string;
  profile_picture: string | null;
  rating: number | null;
  tags: string | null; // JSON-encoded string[]
  created_at: string;
}

export function getAllSuggestions(): Suggestion[] {
  return getDb()
    .prepare("SELECT * FROM suggestions ORDER BY created_at DESC")
    .all() as Suggestion[];
}

export function addSuggestion(data: {
  facebook_url: string;
  facebook_id?: string | null;
  name: string;
  profile_picture?: string | null;
}): Suggestion {
  const stmt = getDb().prepare(`
    INSERT INTO suggestions (facebook_url, facebook_id, name, profile_picture)
    VALUES (@facebook_url, @facebook_id, @name, @profile_picture)
  `);
  const result = stmt.run({
    facebook_url: data.facebook_url,
    facebook_id: data.facebook_id ?? null,
    name: data.name,
    profile_picture: data.profile_picture ?? null,
  });
  return getDb()
    .prepare("SELECT * FROM suggestions WHERE id = ?")
    .get(result.lastInsertRowid) as Suggestion;
}

export function updateSuggestion(
  id: number,
  data: {
    facebook_url: string;
    name: string;
    profile_picture: string | null;
    rating: number | null;
    tags: string | null;
  }
): void {
  getDb()
    .prepare(
      `UPDATE suggestions SET facebook_url = @facebook_url, name = @name, profile_picture = @profile_picture, rating = @rating, tags = @tags WHERE id = @id`
    )
    .run({ id, ...data });
}

export function deleteSuggestion(id: number): void {
  getDb().prepare("DELETE FROM suggestions WHERE id = ?").run(id);
}
