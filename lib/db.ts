import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations";
import * as schema from "./schema";
import { DEFAULT_CATEGORIES } from "./seeds";

const expo = openDatabaseSync("outflow.db");

export const db = drizzle(expo, { schema });

export function useDatabaseMigration() {
  return useMigrations(db, migrations);
}

export async function seedDefaultCategories() {
  const existing = await db.select().from(schema.categories).limit(1);
  if (existing.length > 0) return;
  await db.insert(schema.categories).values(DEFAULT_CATEGORIES);
}
