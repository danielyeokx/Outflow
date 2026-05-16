import { useQuery } from "@tanstack/react-query";
import { db } from "./db";
import { expenses, categories, learnedKeywords, recurringExpenses } from "./schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { monthBounds } from "./format";
import { readSettings } from "./settings";
import { convertCurrency } from "./rates";
import { KEYWORD_MAP } from "./categorize";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      db.select().from(categories).orderBy(categories.sortOrder),
  });
}

export function useExpenses(monthISO: string) {
  const { start, end } = monthBounds(monthISO);
  return useQuery({
    queryKey: ["expenses", monthISO],
    queryFn: () =>
      db
        .select({
          id: expenses.id,
          categoryId: expenses.categoryId,
          amountCents: expenses.amountCents,
          currency: expenses.currency,
          itemName: expenses.itemName,
          spentAt: expenses.spentAt,
          note: expenses.note,
          createdAt: expenses.createdAt,
          categoryName: categories.name,
          categoryColor: categories.color,
          categoryIcon: categories.icon,
        })
        .from(expenses)
        .innerJoin(categories, eq(expenses.categoryId, categories.id))
        .where(
          and(gte(expenses.spentAt, start), lte(expenses.spentAt, end))
        )
        .orderBy(desc(expenses.spentAt), desc(expenses.createdAt)),
  });
}

export type ExpenseWithCategory = NonNullable<
  ReturnType<typeof useExpenses>["data"]
>[number];

export function useMonthlySummary(monthISO: string) {
  const { start, end } = monthBounds(monthISO);
  return useQuery({
    queryKey: ["monthly-summary", monthISO],
    queryFn: async () => {
      const { defaultCurrency } = await readSettings();
      const rows = await db
        .select({
          categoryId: expenses.categoryId,
          categoryName: categories.name,
          categoryColor: categories.color,
          categoryIcon: categories.icon,
          amountCents: expenses.amountCents,
          currency: expenses.currency,
        })
        .from(expenses)
        .innerJoin(categories, eq(expenses.categoryId, categories.id))
        .where(and(gte(expenses.spentAt, start), lte(expenses.spentAt, end)));

      type CatRow = { categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string; total: number };
      const map = new Map<string, CatRow>();
      for (const r of rows) {
        const converted = convertCurrency(r.amountCents, r.currency, defaultCurrency);
        if (!map.has(r.categoryId)) {
          map.set(r.categoryId, { categoryId: r.categoryId, categoryName: r.categoryName, categoryColor: r.categoryColor, categoryIcon: r.categoryIcon, total: 0 });
        }
        map.get(r.categoryId)!.total += converted;
      }

      const result = Array.from(map.values()).sort((a, b) => b.total - a.total);
      const grandTotal = result.reduce((acc, r) => acc + r.total, 0);
      return { rows: result, grandTotal };
    },
  });
}

export function useDailyTotals(monthISO: string) {
  const { start, end } = monthBounds(monthISO);
  return useQuery({
    queryKey: ["daily-totals", monthISO],
    queryFn: async () => {
      const { defaultCurrency } = await readSettings();
      const rows = await db
        .select({
          day: expenses.spentAt,
          amountCents: expenses.amountCents,
          currency: expenses.currency,
        })
        .from(expenses)
        .where(and(gte(expenses.spentAt, start), lte(expenses.spentAt, end)))
        .orderBy(expenses.spentAt);

      const map = new Map<string, number>();
      for (const r of rows) {
        const converted = convertCurrency(r.amountCents, r.currency, defaultCurrency);
        map.set(r.day, (map.get(r.day) ?? 0) + converted);
      }
      return Array.from(map.entries()).map(([day, total]) => ({ day, total })).sort((a, b) => a.day.localeCompare(b.day));
    },
  });
}

export function useKeywordsForCategory(categoryId: string) {
  return useQuery({
    queryKey: ["keywords", categoryId],
    queryFn: () =>
      db
        .select()
        .from(learnedKeywords)
        .where(eq(learnedKeywords.categoryId, categoryId))
        .orderBy(learnedKeywords.keyword),
  });
}

export function useRecurring() {
  return useQuery({
    queryKey: ["recurring"],
    queryFn: () =>
      db
        .select({
          id: recurringExpenses.id,
          itemName: recurringExpenses.itemName,
          amountCents: recurringExpenses.amountCents,
          currency: recurringExpenses.currency,
          categoryId: recurringExpenses.categoryId,
          frequency: recurringExpenses.frequency,
          dayOfMonth: recurringExpenses.dayOfMonth,
          dayOfWeek: recurringExpenses.dayOfWeek,
          intervalDays: recurringExpenses.intervalDays,
          monthOfYear: recurringExpenses.monthOfYear,
          startDate: recurringExpenses.startDate,
          endDate: recurringExpenses.endDate,
          lastLoggedDate: recurringExpenses.lastLoggedDate,
          note: recurringExpenses.note,
          isActive: recurringExpenses.isActive,
          createdAt: recurringExpenses.createdAt,
          categoryName: categories.name,
          categoryColor: categories.color,
          categoryIcon: categories.icon,
        })
        .from(recurringExpenses)
        .innerJoin(categories, eq(recurringExpenses.categoryId, categories.id))
        .where(eq(recurringExpenses.isActive, true))
        .orderBy(recurringExpenses.createdAt),
  });
}

export type RecurringWithCategory = NonNullable<ReturnType<typeof useRecurring>["data"]>[number];

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () =>
      db
        .select({
          id: expenses.id,
          categoryId: expenses.categoryId,
          amountCents: expenses.amountCents,
          currency: expenses.currency,
          itemName: expenses.itemName,
          spentAt: expenses.spentAt,
          note: expenses.note,
        })
        .from(expenses)
        .where(eq(expenses.id, id))
        .then((rows) => rows[0] ?? null),
    enabled: !!id,
  });
}

export function useDefaultCurrency() {
  return useQuery({
    queryKey: ["settings", "defaultCurrency"],
    queryFn: async () => (await readSettings()).defaultCurrency,
    staleTime: Infinity,
  });
}

export function useLearnedKeywords() {
  return useQuery({
    queryKey: ["learned-keywords"],
    queryFn: async () => {
      const { staticKeywordsEnabled } = await readSettings();
      const rows = await db.select().from(learnedKeywords);
      const dbMap = Object.fromEntries(rows.map((r) => [r.keyword, r.categoryId]));
      // Merge static map when enabled — DB entries take priority (user overrides static)
      return staticKeywordsEnabled ? { ...KEYWORD_MAP, ...dbMap } : dbMap;
    },
  });
}

export function useStaticKeywordsEnabled() {
  return useQuery({
    queryKey: ["settings", "staticKeywordsEnabled"],
    queryFn: async () => (await readSettings()).staticKeywordsEnabled,
    staleTime: Infinity,
  });
}
