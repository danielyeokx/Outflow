import { useQuery } from "@tanstack/react-query";
import { db } from "./db";
import { expenses, categories, learnedKeywords } from "./schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { monthBounds } from "./format";

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
      const rows = await db
        .select({
          categoryId: expenses.categoryId,
          categoryName: categories.name,
          categoryColor: categories.color,
          categoryIcon: categories.icon,
          total: sql<number>`sum(${expenses.amountCents})`,
        })
        .from(expenses)
        .innerJoin(categories, eq(expenses.categoryId, categories.id))
        .where(
          and(gte(expenses.spentAt, start), lte(expenses.spentAt, end))
        )
        .groupBy(expenses.categoryId)
        .orderBy(desc(sql`sum(${expenses.amountCents})`));

      const grandTotal = rows.reduce((acc, r) => acc + r.total, 0);
      return { rows, grandTotal };
    },
  });
}

export function useDailyTotals(monthISO: string) {
  const { start, end } = monthBounds(monthISO);
  return useQuery({
    queryKey: ["daily-totals", monthISO],
    queryFn: () =>
      db
        .select({
          day: expenses.spentAt,
          total: sql<number>`sum(${expenses.amountCents})`,
        })
        .from(expenses)
        .where(
          and(gte(expenses.spentAt, start), lte(expenses.spentAt, end))
        )
        .groupBy(expenses.spentAt)
        .orderBy(expenses.spentAt),
  });
}

export function useLearnedKeywords() {
  return useQuery({
    queryKey: ["learned-keywords"],
    queryFn: async () => {
      const rows = await db.select().from(learnedKeywords);
      return Object.fromEntries(rows.map((r) => [r.keyword, r.categoryId]));
    },
  });
}
