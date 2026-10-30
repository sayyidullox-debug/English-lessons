import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type Db = DatabaseSync;
export interface Migration {
  /** Ketma-ket oshib boruvchi butun son; `PRAGMA user_version` da saqlanadi. */
  id: number;
  sql: string;
}

export function migrate(db: Db, migrations: Migration[]): void {
  const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
  for (const m of [...migrations].sort((a, b) => a.id - b.id)) {
    if (m.id <= row.user_version) continue;
    db.exec("BEGIN");
    try {
      db.exec(m.sql);
      db.exec(`PRAGMA user_version = ${m.id}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw new Error(`Migratsiya ${m.id} xato bilan tugadi`, { cause: error });
    }
  }
}

export function openDb(path: string, migrations: Migration[]): Db {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  migrate(db, migrations);
  return db;
}

/** Tranzaksiya ichida bajaradi; xato bo'lsa orqaga qaytaradi. */
export function transaction<T>(db: Db, fn: () => T): T {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
