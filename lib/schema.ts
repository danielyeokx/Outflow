import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  colorOverride: text("color_override"), // user-picked color; only applies (and is editable) in the multi color theme
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

export type Frequency = 'monthly' | 'weekly' | 'yearly' | 'custom';

export const recurringExpenses = sqliteTable("recurring_expenses", {
  id:            text("id").primaryKey(),
  itemName:      text("item_name").notNull(),
  amountCents:   int("amount_cents").notNull(),
  currency:      text("currency").notNull().default("SGD"),
  categoryId:    text("category_id").notNull().references(() => categories.id),
  frequency:     text("frequency").notNull(),      // Frequency
  dayOfMonth:    int("day_of_month"),              // 1-31, monthly + yearly
  dayOfWeek:     int("day_of_week"),               // 0-6 (Sun=0), weekly
  intervalDays:  int("interval_days"),             // custom
  monthOfYear:   int("month_of_year"),             // 1-12, yearly
  startDate:     text("start_date").notNull(),     // YYYY-MM-DD
  endDate:       text("end_date"),                 // YYYY-MM-DD, nullable
  lastLoggedDate: text("last_logged_date"),        // YYYY-MM-DD, nullable
  note:          text("note"),
  isActive:      int("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt:     text("created_at").notNull(),
});

export type RecurringExpense = typeof recurringExpenses.$inferSelect;

export const recurringFormSchema = z.object({
  itemName:     z.string().min(1, "Item name is required").max(100),
  amountCents:  z.number().int().min(1, "Amount must be greater than 0"),
  currency:     z.string().optional(),
  categoryId:   z.string().min(1, "Select a category"),
  frequency:    z.enum(["monthly", "weekly", "yearly", "custom"]),
  dayOfMonth:   z.number().int().min(1).max(31).optional(),
  dayOfWeek:    z.number().int().min(0).max(6).optional(),
  intervalDays: z.number().int().min(1).optional(),
  monthOfYear:  z.number().int().min(1).max(12).optional(),
  note:         z.string().max(200).optional(),
  // Expiry: null = forever, otherwise stop after end of this month/year
  expiryMonth:  z.number().int().min(1).max(12).optional(),
  expiryYear:   z.number().int().min(2024).max(2099).optional(),
});

export type RecurringFormValues = z.infer<typeof recurringFormSchema>;

export const expenseFormSchema = z.object({
  amountCents: z.number().int().min(1, "Amount must be greater than 0"),
  currency: z.string().optional(),
  itemName: z.string().min(1, "Item name is required").max(100),
  categoryId: z.string().min(1, "Select a category"),
  spentAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  note: z.string().max(200).optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
