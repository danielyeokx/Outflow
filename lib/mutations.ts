import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { expenses, learnedKeywords, categories } from "./schema";
import { eq } from "drizzle-orm";
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
