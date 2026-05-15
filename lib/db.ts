import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations";
import * as schema from "./schema";
import { DEFAULT_CATEGORIES } from "./seeds";
import { eq } from "drizzle-orm";
import { getDueDates, todayDate } from "./recurring";
import { format, addDays } from "date-fns";

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

function newId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function processRecurringExpenses() {
  try {
    const today = format(todayDate(), "yyyy-MM-dd");
    const actives = await db
      .select()
      .from(schema.recurringExpenses)
      .where(eq(schema.recurringExpenses.isActive, true));

    for (const r of actives) {
      if (r.endDate && r.endDate < today) continue;

      // fromDate: day after last logged, or start date if never logged
      const fromDate = r.lastLoggedDate
        ? format(addDays(new Date(r.lastLoggedDate), 1), "yyyy-MM-dd")
        : r.startDate;

      if (fromDate > today) continue;

      const dueDates = getDueDates(r, fromDate, today);
      if (dueDates.length === 0) continue;

      for (const date of dueDates) {
        await db.insert(schema.expenses).values({
          id: newId(),
          categoryId: r.categoryId,
          amountCents: r.amountCents,
          currency: r.currency,
          itemName: r.itemName,
          spentAt: date,
          note: r.note ?? null,
          createdAt: new Date().toISOString(),
        });
      }

      await db
        .update(schema.recurringExpenses)
        .set({ lastLoggedDate: today })
        .where(eq(schema.recurringExpenses.id, r.id));
    }
  } catch (e) {
    console.warn("[outflow] recurring processing failed:", e);
  }
}
