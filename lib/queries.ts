import { useQuery } from "@tanstack/react-query";
import { db } from "./db";
import { expenses, categories, learnedKeywords, recurringExpenses } from "./schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { monthBounds } from "./format";
import { readSettings } from "./settings";
import { convertCurrency } from "./rates";
import { KEYWORD_MAP, normaliseKeyword } from "./categorize";

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
          categoryColorOverride: categories.colorOverride,
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
          categoryColorOverride: categories.colorOverride,
          categoryIcon: categories.icon,
          amountCents: expenses.amountCents,
          currency: expenses.currency,
        })
        .from(expenses)
        .innerJoin(categories, eq(expenses.categoryId, categories.id))
        .where(and(gte(expenses.spentAt, start), lte(expenses.spentAt, end)));

      type CatRow = { categoryId: string; categoryName: string; categoryColor: string; categoryColorOverride: string | null; categoryIcon: string; total: number };
      const map = new Map<string, CatRow>();
      for (const r of rows) {
        const converted = convertCurrency(r.amountCents, r.currency, defaultCurrency);
        if (!map.has(r.categoryId)) {
          map.set(r.categoryId, { categoryId: r.categoryId, categoryName: r.categoryName, categoryColor: r.categoryColor, categoryColorOverride: r.categoryColorOverride, categoryIcon: r.categoryIcon, total: 0 });
        }
        map.get(r.categoryId)!.total += converted;
      }

      const result = Array.from(map.values()).sort((a, b) => b.total - a.total);
      const grandTotal = result.reduce((acc, r) => acc + r.total, 0);
      return { rows: result, grandTotal };
    },
  });
}

export interface DayCategoryTotal {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryColorOverride: string | null;
  total: number;
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
          categoryId: expenses.categoryId,
          categoryName: categories.name,
          categoryColor: categories.color,
          categoryColorOverride: categories.colorOverride,
        })
        .from(expenses)
        .innerJoin(categories, eq(expenses.categoryId, categories.id))
        .where(and(gte(expenses.spentAt, start), lte(expenses.spentAt, end)))
        .orderBy(expenses.spentAt);

      const dayMap = new Map<string, Map<string, DayCategoryTotal>>();
      const monthTotals = new Map<string, number>(); // categoryId -> full-month total, for a stable stack order
      for (const r of rows) {
        const converted = convertCurrency(r.amountCents, r.currency, defaultCurrency);
        if (!dayMap.has(r.day)) dayMap.set(r.day, new Map());
        const catMap = dayMap.get(r.day)!;
        if (!catMap.has(r.categoryId)) {
          catMap.set(r.categoryId, { categoryId: r.categoryId, categoryName: r.categoryName, categoryColor: r.categoryColor, categoryColorOverride: r.categoryColorOverride, total: 0 });
        }
        catMap.get(r.categoryId)!.total += converted;
        monthTotals.set(r.categoryId, (monthTotals.get(r.categoryId) ?? 0) + converted);
      }

      // Rank categories by their share of the whole month's spend, not just
      // that day's — keeps each category in the same stack position every
      // day instead of reshuffling based on which happened to be biggest today.
      const categoryRank = new Map(
        Array.from(monthTotals.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([categoryId], index) => [categoryId, index])
      );

      // Every day of the month, start..end inclusive — zero for no-spend days
      const days: string[] = [];
      for (const d = new Date(start + 'T12:00:00Z'); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        days.push(d.toISOString().slice(0, 10));
      }
      return days.map((day) => {
        // Category with the largest month-wide share goes first so it renders at the bottom of the stack
        const dayCategories = Array.from(dayMap.get(day)?.values() ?? [])
          .sort((a, b) => categoryRank.get(a.categoryId)! - categoryRank.get(b.categoryId)!);
        const total = dayCategories.reduce((acc, c) => acc + c.total, 0);
        return { day, total, categories: dayCategories };
      });
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
          categoryColorOverride: categories.colorOverride,
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

export interface RecentExpenseChip {
  itemName: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryColorOverride: string | null;
  categoryIcon: string;
}

// Most recent distinct items — powers "quick add" chips for repeat expenses
// (e.g. daily bus fare) whose amount varies each time.
export function useRecentExpenseChips(limit = 5) {
  return useQuery({
    queryKey: ["recent-expense-chips"],
    queryFn: async () => {
      const rows = await db
        .select({
          itemName: expenses.itemName,
          categoryId: expenses.categoryId,
          categoryName: categories.name,
          categoryColor: categories.color,
          categoryColorOverride: categories.colorOverride,
          categoryIcon: categories.icon,
        })
        .from(expenses)
        .innerJoin(categories, eq(expenses.categoryId, categories.id))
        .orderBy(desc(expenses.spentAt), desc(expenses.createdAt))
        .limit(50);

      const seen = new Set<string>();
      const chips: RecentExpenseChip[] = [];
      for (const r of rows) {
        const key = normaliseKeyword(r.itemName);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        chips.push(r);
        if (chips.length >= limit) break;
      }
      return chips;
    },
  });
}

export function useColorTheme() {
  return useQuery({
    queryKey: ["settings", "colorTheme"],
    queryFn: async () => (await readSettings()).colorTheme,
    staleTime: Infinity,
  });
}

export function useWeekStartsOn() {
  return useQuery({
    queryKey: ["settings", "weekStartsOn"],
    queryFn: async () => (await readSettings()).weekStartsOn,
    staleTime: Infinity,
  });
}
