import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  isDefault: int("is_default", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  amountCents: int("amount_cents").notNull(),
  currency: text("currency").notNull().default("SGD"),
  itemName: text("item_name").notNull(),
  spentAt: text("spent_at").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull(),
});

// Stores user-taught keyword → category mappings learned at runtime
export const learnedKeywords = sqliteTable("learned_keywords", {
  keyword: text("keyword").primaryKey(), // normalised lowercase item name
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  updatedAt: text("updated_at").notNull(),
});

export const expenseFormSchema = z.object({
  amountCents: z.number().int().min(1, "Amount must be greater than 0"),
  itemName: z.string().min(1, "Item name is required").max(100),
  categoryId: z.string().min(1, "Select a category"),
  spentAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  note: z.string().max(200).optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
