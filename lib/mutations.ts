import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { expenses, learnedKeywords, categories, recurringExpenses } from "./schema";
import { RecurringFormValues } from "./schema";
import { getDaysInMonth } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { ExpenseFormValues } from "./schema";
import { todayISO } from "./format";
import { normaliseKeyword, suggestCategoryId } from "./categorize";

const CATEGORY_GRAYS = [
  '#CCCCCC', '#AAAAAA', '#888888', '#EEEEEE',
  '#BBBBBB', '#999999', '#666666', '#DDDDDD',
];

function newId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      const id = newId();
      await db.insert(expenses).values({
        id,
        categoryId: values.categoryId,
        amountCents: values.amountCents,
        currency: "SGD",
        itemName: values.itemName,
        spentAt: values.spentAt ?? todayISO(),
        note: values.note ?? null,
        createdAt: new Date().toISOString(),
      });

      // Learn keyword — non-critical, must not break the main save flow
      try {
        const keyword = normaliseKeyword(values.itemName);
        const staticMatch = suggestCategoryId(values.itemName);
        if (!staticMatch && keyword) {
          await db
            .insert(learnedKeywords)
            .values({ keyword, categoryId: values.categoryId, updatedAt: new Date().toISOString() })
            .onConflictDoUpdate({
              target: learnedKeywords.keyword,
              set: { categoryId: values.categoryId, updatedAt: new Date().toISOString() },
            });
          queryClient.invalidateQueries({ queryKey: ["learned-keywords"] });
        }
      } catch (e) {
        console.warn("[outflow] keyword learn failed:", e);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["daily-totals"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await db.delete(expenses).where(eq(expenses.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["daily-totals"] });
    },
  });
}

export function useAddKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyword, categoryId }: { keyword: string; categoryId: string }) => {
      const k = normaliseKeyword(keyword);
      if (!k) throw new Error("Keyword cannot be empty");
      await db
        .insert(learnedKeywords)
        .values({ keyword: k, categoryId, updatedAt: new Date().toISOString() })
        .onConflictDoUpdate({
          target: learnedKeywords.keyword,
          set: { categoryId, updatedAt: new Date().toISOString() },
        });
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ["keywords", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["learned-keywords"] });
    },
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyword, categoryId }: { keyword: string; categoryId: string }) => {
      await db.delete(learnedKeywords).where(eq(learnedKeywords.keyword, keyword));
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ["keywords", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["learned-keywords"] });
    },
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, icon, existingCount }: { name: string; icon: string; existingCount: number }) => {
      const id = newId();
      const color = CATEGORY_GRAYS[existingCount % CATEGORY_GRAYS.length];
      await db.insert(categories).values({
        id,
        name,
        color,
        icon,
        sortOrder: existingCount,
        isDefault: false,
        createdAt: new Date().toISOString(),
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useRenameCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await db.update(categories).set({ name }).where(eq(categories.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const [{ cnt: expCount }] = await db
        .select({ cnt: sql<number>`count(*)` })
        .from(expenses)
        .where(eq(expenses.categoryId, id));
      const [{ cnt: recCount }] = await db
        .select({ cnt: sql<number>`count(*)` })
        .from(recurringExpenses)
        .where(eq(recurringExpenses.categoryId, id));
      if (expCount > 0 || recCount > 0) {
        throw new Error("CATEGORY_IN_USE");
      }
      await db.delete(learnedKeywords).where(eq(learnedKeywords.categoryId, id));
      await db.delete(categories).where(eq(categories.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useAddRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: RecurringFormValues) => {
      const id = newId();
      // Auto-set start to today; end to last day of expiry month/year if set
      const startDate = new Date().toISOString().slice(0, 10);
      let endDate: string | null = null;
      if (values.expiryYear && values.expiryMonth) {
        const lastDay = getDaysInMonth(new Date(values.expiryYear, values.expiryMonth - 1));
        endDate = `${values.expiryYear}-${String(values.expiryMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      }
      await db.insert(recurringExpenses).values({
        id,
        itemName: values.itemName,
        amountCents: values.amountCents,
        currency: "SGD",
        categoryId: values.categoryId,
        frequency: values.frequency,
        dayOfMonth: values.dayOfMonth ?? null,
        dayOfWeek: values.dayOfWeek ?? null,
        intervalDays: values.intervalDays ?? null,
        monthOfYear: values.monthOfYear ?? null,
        startDate,
        endDate,
        lastLoggedDate: null,
        note: values.note ?? null,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}
