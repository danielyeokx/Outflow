import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { expenses, learnedKeywords } from "./schema";
import { eq } from "drizzle-orm";
import { ExpenseFormValues } from "./schema";
import { todayISO } from "./format";
import { normaliseKeyword, suggestCategoryId } from "./categorize";

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

      // Learn keyword if no static rule matched — persist for future auto-pick
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
