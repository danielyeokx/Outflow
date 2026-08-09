import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { db } from "./db";
import { expenses, learnedKeywords, categories, recurringExpenses } from "./schema";
import { RecurringFormValues } from "./schema";
import { getDaysInMonth } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { ExpenseFormValues } from "./schema";
import { todayISO } from "./format";
import { normaliseKeyword, suggestCategoryId } from "./categorize";
import { writeSettings, readSettings, AppSettings } from "./settings";
import { DEFAULT_CATEGORIES } from "./seeds";
import { ColorTheme, CATEGORY_SWATCHES } from "./theme";

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
      const { defaultCurrency } = await readSettings();
      await db.insert(expenses).values({
        id,
        categoryId: values.categoryId,
        amountCents: values.amountCents,
        currency: values.currency ?? defaultCurrency,
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
      queryClient.invalidateQueries({ queryKey: ["recent-expense-chips"] });
      queryClient.refetchQueries({ queryKey: ["daily-totals"] });
      queryClient.refetchQueries({ queryKey: ["monthly-summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["recent-expense-chips"] });
      queryClient.refetchQueries({ queryKey: ["daily-totals"] });
      queryClient.refetchQueries({ queryKey: ["monthly-summary"] });
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
      const color = CATEGORY_SWATCHES[existingCount % CATEGORY_SWATCHES.length];
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

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values, currency }: { id: string; values: ExpenseFormValues; currency: string }) => {
      const { defaultCurrency } = await readSettings();
      await db.update(expenses).set({
        categoryId: values.categoryId,
        amountCents: values.amountCents,
        currency: currency ?? values.currency ?? defaultCurrency,
        itemName: values.itemName,
        spentAt: values.spentAt ?? todayISO(),
        note: values.note ?? null,
      }).where(eq(expenses.id, id));
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["recent-expense-chips"] });
      queryClient.refetchQueries({ queryKey: ["daily-totals"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      queryClient.refetchQueries({ queryKey: ["monthly-summary"] });
    },
  });
}

export function useAddRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: RecurringFormValues) => {
      const id = newId();
      const { defaultCurrency } = await readSettings();
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
        currency: values.currency ?? defaultCurrency,
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

export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: RecurringFormValues }) => {
      let endDate: string | null = null;
      if (values.expiryYear && values.expiryMonth) {
        const lastDay = getDaysInMonth(new Date(values.expiryYear, values.expiryMonth - 1));
        endDate = `${values.expiryYear}-${String(values.expiryMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      }
      const { defaultCurrency } = await readSettings();
      await db.update(recurringExpenses).set({
        itemName: values.itemName,
        amountCents: values.amountCents,
        currency: values.currency ?? defaultCurrency,
        categoryId: values.categoryId,
        frequency: values.frequency,
        dayOfMonth: values.dayOfMonth ?? null,
        dayOfWeek: values.dayOfWeek ?? null,
        intervalDays: values.intervalDays ?? null,
        monthOfYear: values.monthOfYear ?? null,
        endDate,
        note: values.note ?? null,
      }).where(eq(recurringExpenses.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}

export function useSetDefaultCurrency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (currency: string) => {
      await writeSettings({ defaultCurrency: currency });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      queryClient.refetchQueries({ queryKey: ["daily-totals"] });
    },
  });
}

export function useSetColorTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (colorTheme: ColorTheme) => {
      await writeSettings({ colorTheme });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateCategoryColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, color }: { id: string; color: string | null }) => {
      await db.update(categories).set({ colorOverride: color }).where(eq(categories.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useClearAllKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await db.delete(learnedKeywords);
      await writeSettings({ staticKeywordsEnabled: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learned-keywords"] });
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useResetCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Clear all learned keywords
      await db.delete(learnedKeywords);

      // Delete user-created categories that have no expenses or recurring entries
      const userCats = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.isDefault, false));

      for (const cat of userCats) {
        const [{ cnt: expCount }] = await db
          .select({ cnt: sql<number>`count(*)` })
          .from(expenses)
          .where(eq(expenses.categoryId, cat.id));
        const [{ cnt: recCount }] = await db
          .select({ cnt: sql<number>`count(*)` })
          .from(recurringExpenses)
          .where(eq(recurringExpenses.categoryId, cat.id));
        if (expCount === 0 && recCount === 0) {
          await db.delete(categories).where(eq(categories.id, cat.id));
        }
      }

      // Re-seed defaults — restores names/icons/colors even if renamed
      for (const cat of DEFAULT_CATEGORIES) {
        await db
          .insert(categories)
          .values(cat)
          .onConflictDoUpdate({
            target: categories.id,
            set: { name: cat.name, color: cat.color, colorOverride: null, icon: cat.icon, sortOrder: cat.sortOrder },
          });
      }
      // Re-enable static keywords
      await writeSettings({ staticKeywordsEnabled: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["learned-keywords"] });
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useClearAllData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await db.delete(expenses);
      await db.delete(recurringExpenses);
      await db.delete(learnedKeywords);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.refetchQueries({ queryKey: ["daily-totals"] });
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      queryClient.invalidateQueries({ queryKey: ["learned-keywords"] });
    },
  });
}

export async function exportExpensesCSV(): Promise<void> {
  const rows = await db
    .select({
      spentAt: expenses.spentAt,
      itemName: expenses.itemName,
      categoryName: categories.name,
      amountCents: expenses.amountCents,
      currency: expenses.currency,
      note: expenses.note,
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .orderBy(expenses.spentAt);

  const header = 'Date,Item,Category,Amount,Currency,Note';
  const lines = rows.map((r) => {
    const note = r.note ? `"${r.note.replace(/"/g, '""')}"` : '';
    return `${r.spentAt},"${r.itemName.replace(/"/g, '""')}","${r.categoryName}",${(r.amountCents / 100).toFixed(2)},${r.currency},${note}`;
  });

  const csv = [header, ...lines].join('\n');
  const path = `${FileSystem.documentDirectory}outflow-${todayISO()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: 'utf8' });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }
  await Sharing.shareAsync(path, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
}

const BACKUP_VERSION = 1;

type Backup = {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  categories: unknown[];
  expenses: unknown[];
  learnedKeywords: unknown[];
  recurringExpenses: unknown[];
};

function isValidBackup(data: any): data is Backup {
  return (
    data &&
    typeof data === "object" &&
    data.version === BACKUP_VERSION &&
    data.settings && typeof data.settings === "object" &&
    Array.isArray(data.categories) &&
    Array.isArray(data.expenses) &&
    Array.isArray(data.learnedKeywords) &&
    Array.isArray(data.recurringExpenses)
  );
}

// Full local snapshot — categories, expenses, recurring entries, keywords, and settings —
// for moving all data to another device without a backend. Not meant to be human-readable.
export async function exportBackup(): Promise<void> {
  const [cats, exps, keywords, recurring, settings] = await Promise.all([
    db.select().from(categories),
    db.select().from(expenses),
    db.select().from(learnedKeywords),
    db.select().from(recurringExpenses),
    readSettings(),
  ]);

  const backup: Backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    categories: cats,
    expenses: exps,
    learnedKeywords: keywords,
    recurringExpenses: recurring,
  };

  const path = `${FileSystem.documentDirectory}outflow-backup-${todayISO()}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(backup), { encoding: 'utf8' });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }
  await Sharing.shareAsync(path, { mimeType: 'application/json', UTI: 'public.json' });
}

// Replaces all local data with the contents of a previously exported backup file.
export function useImportBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const picked = await DocumentPicker.getDocumentAsync({ type: ["application/json", "public.json"], copyToCacheDirectory: true });
      if (picked.canceled) return false;

      const json = await FileSystem.readAsStringAsync(picked.assets[0].uri, { encoding: 'utf8' });
      const data = JSON.parse(json);
      if (!isValidBackup(data)) {
        throw new Error("This file isn't a valid Outflow backup.");
      }

      await db.transaction(async (tx) => {
        await tx.delete(expenses);
        await tx.delete(recurringExpenses);
        await tx.delete(learnedKeywords);
        await tx.delete(categories);

        if (data.categories.length) await tx.insert(categories).values(data.categories as any);
        if (data.expenses.length) await tx.insert(expenses).values(data.expenses as any);
        if (data.learnedKeywords.length) await tx.insert(learnedKeywords).values(data.learnedKeywords as any);
        if (data.recurringExpenses.length) await tx.insert(recurringExpenses).values(data.recurringExpenses as any);
      });

      await writeSettings(data.settings);
      return true;
    },
    onSuccess: (imported) => {
      if (!imported) return;
      queryClient.invalidateQueries();
      queryClient.refetchQueries({ queryKey: ["daily-totals"] });
      queryClient.refetchQueries({ queryKey: ["monthly-summary"] });
    },
  });
}
