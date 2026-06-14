import { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, Pressable,
  ActivityIndicator, Alert,
} from "react-native";
import { format, parseISO, getDaysInMonth } from "date-fns";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router, useLocalSearchParams } from "expo-router";
import { X, Trash2, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseFormSchema, ExpenseFormValues } from "../../lib/schema";
import { useCategories, useDefaultCurrency, useExpense } from "../../lib/queries";
import { useUpdateExpense, useDeleteExpense } from "../../lib/mutations";
import { todayISO } from "../../lib/format";
import { CURRENCIES, getCurrencyDecimals } from "../../lib/rates";
import { T, input } from "../../lib/theme";
import Sheet from "../../components/Sheet";
import CategoryPicker from "../../components/expense/CategoryPicker";

const MONTHS_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function formatDigits(d: string, decimals: number): string {
  if (!d) return "";
  if (decimals === 0) return String(parseInt(d, 10));
  const p = d.padStart(3, "0");
  return `${String(parseInt(p.slice(0, -2), 10))}.${p.slice(-2)}`;
}

function centsToDigits(cents: number): string {
  return String(cents);
}

const L = { color: T.text.muted, fontSize: 10, letterSpacing: 2, fontFamily: 'SpaceMono-Regular' as const, marginBottom: 8 };

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: expense, isLoading } = useExpense(id);
  const { data: categories = [] } = useCategories();
  const { data: defaultCurrency = "SGD" } = useDefaultCurrency();
  const { mutate: updateExpense, isPending: pendingUpdate } = useUpdateExpense();
  const { mutate: deleteExpense, isPending: pendingDelete } = useDeleteExpense();

  const [amountDigits, setAmountDigits] = useState("");
  const [currency, setCurrencyState] = useState(defaultCurrency);
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<any>(null);
  const dateSectionY = useRef(0);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { amountCents: 0, itemName: "", categoryId: "", spentAt: todayISO() },
  });

  useEffect(() => {
    if (expense && !initialized) {
      const digits = centsToDigits(expense.amountCents);
      setAmountDigits(digits);
      form.reset({
        amountCents: expense.amountCents,
        itemName: expense.itemName,
        categoryId: expense.categoryId,
        spentAt: expense.spentAt,
        currency: expense.currency,
      });
      setCurrencyState(expense.currency);
      setInitialized(true);
    }
  }, [expense, initialized]);

  useEffect(() => {
    if (!datePickerOpen) return;
    setTimeout(() => {
      scrollRef.current?.scrollToPosition(0, dateSectionY.current, true);
    }, 50);
  }, [datePickerOpen]);

  const spentAt = form.watch("spentAt");
  const categoryId = form.watch("categoryId");
  const errors = form.formState.errors;
  const isPending = pendingUpdate || pendingDelete;

  function onSave() {
    form.handleSubmit((values) => {
      updateExpense(
        { id, values, currency },
        { onSuccess: () => router.back(), onError: () => Alert.alert("Error", "Could not save changes.") }
      );
    })();
  }

  function onDelete() {
    Alert.alert("Delete?", `Remove "${expense?.itemName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => deleteExpense(id, { onSuccess: () => router.back() }),
      },
    ]);
  }

  if (isLoading || !initialized) {
    return (
      <Sheet>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={T.text.secondary} />
        </View>
      </Sheet>
    );
  }

  if (!expense) {
    return (
      <Sheet>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>EXPENSE NOT FOUND</Text>
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.INPUT</Text>
          <Text style={{ color: T.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>EDIT ENTRY</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={onDelete} disabled={isPending} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={14} color={T.text.muted} />
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={T.text.secondary} />
          </Pressable>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: T.border }} />

      {/* Scrollable form */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={24}
        enableOnAndroid
      >
        {/* Amount */}
        <View>
          <Text style={L}>AMOUNT</Text>
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 8 }}>
            <TextInput
              style={{ ...input, flex: 1, fontSize: 26, fontFamily: 'SpaceMono-Regular', borderColor: errors.amountCents ? '#666' : T.border }}
              placeholder={getCurrencyDecimals(currency) === 0 ? "> 0" : "> 0.00"} placeholderTextColor={T.text.muted} keyboardType="number-pad"
              value={amountDigits ? `> ${formatDigits(amountDigits, getCurrencyDecimals(currency))}` : ""}
              onChangeText={(text) => {
                const d = text.replace(/\D/g, "").slice(-(getCurrencyDecimals(currency) === 0 ? 9 : 7));
                setAmountDigits(d);
                form.setValue("amountCents", parseInt(d || "0", 10));
              }}
            />
            <Pressable
              onPress={() => setCurrencyPickerOpen((o) => !o)}
              style={{ aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.elevated, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}
            >
              <Text style={{ color: T.text.secondary, fontSize: 11, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>{currency}</Text>
            </Pressable>
          </View>
          {currencyPickerOpen && (
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, marginTop: 6, paddingVertical: 4 }}>
              {CURRENCIES.map((c) => {
                const active = currency === c.code;
                return (
                  <Pressable key={c.code} onPress={() => { setCurrencyState(c.code); setCurrencyPickerOpen(false); }}>
                    {({ pressed }) => (
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, backgroundColor: active ? T.elevated : pressed ? T.elevated : 'transparent' }}>
                        <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', width: 44 }}>{c.code}</Text>
                        <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular', flex: 1 }}>{c.label}</Text>
                        {active && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.text.secondary }} />}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
          {errors.amountCents && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.amountCents.message}</Text>}
        </View>

        {/* Item name */}
        <View>
          <Text style={L}>ITEM.NAME</Text>
          <TextInput
            style={{ ...input, fontSize: 26, fontFamily: 'SpaceMono-Regular', borderColor: errors.itemName ? '#666' : T.border }}
            placeholder="DESCRIBE EXPENSE..." placeholderTextColor={T.text.muted}
            value={form.watch("itemName")}
            onChangeText={(v) => form.setValue("itemName", v)}
            returnKeyType="next"
          />
          {errors.itemName && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.itemName.message}</Text>}
        </View>

        {/* Category + Date row */}
        <View style={{ flexDirection: 'row', gap: 8 }} onLayout={(e) => { dateSectionY.current = e.nativeEvent.layout.y; }}>
          <View style={{ flex: 1 }}>
            <Text style={L}>CATEGORY</Text>
            <CategoryPicker
              categories={categories}
              value={categoryId || null}
              onChange={(id) => form.setValue("categoryId", id)}
              error={errors.categoryId?.message}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={L}>DATE</Text>
            <Pressable
              style={{ ...input, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              onPress={() => setDatePickerOpen(o => !o)}
            >
              <Text style={{ color: T.text.primary, fontSize: 14, fontFamily: 'SpaceMono-Regular' }}>
                {format(spentAt ? parseISO(spentAt) : new Date(), 'd MMM yyyy').toUpperCase()}
              </Text>
              <CalendarDays size={16} color={T.text.secondary} />
            </Pressable>
          </View>
        </View>

        {/* Date picker */}
        {datePickerOpen && (() => {
          const date = spentAt ? parseISO(spentAt) : new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const today = new Date();
          const daysInMonth = getDaysInMonth(new Date(year, month - 1));

          function updateDate(y: number, m: number, d: number) {
            const maxDay = getDaysInMonth(new Date(y, m - 1));
            form.setValue("spentAt", format(new Date(y, m - 1, Math.min(d, maxDay)), 'yyyy-MM-dd'));
          }

          const dayRows: number[][] = [];
          for (let r = 0; r < Math.ceil(31 / 7); r++) {
            dayRows.push(Array.from({ length: 7 }, (_, i) => r * 7 + i + 1));
          }

          return (
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, gap: 14, marginTop: -12 }}>
              {/* Year */}
              <View>
                <Text style={{ ...L, marginBottom: 10 }}>YEAR</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable onPress={() => updateDate(year - 1, month, day)} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={16} color={T.text.secondary} />
                  </Pressable>
                  <Text style={{ color: T.text.primary, fontSize: 18, fontFamily: 'SpaceMono-Regular', flex: 1, textAlign: 'center' }}>{year}</Text>
                  <Pressable
                    onPress={() => { if (year < today.getFullYear()) updateDate(year + 1, month, day); }}
                    style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronRight size={16} color={year >= today.getFullYear() ? T.text.muted : T.text.secondary} />
                  </Pressable>
                </View>
              </View>

              {/* Month */}
              <View>
                <Text style={{ ...L, marginBottom: 10 }}>MONTH</Text>
                <View style={{ gap: 5 }}>
                  {[MONTHS_SHORT.slice(0, 6), MONTHS_SHORT.slice(6)].map((row, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', gap: 5 }}>
                      {row.map((m, i) => {
                        const mIdx = rowIdx * 6 + i + 1;
                        const isFuture = year === today.getFullYear() && mIdx > today.getMonth() + 1;
                        const active = month === mIdx;
                        return (
                          <Pressable key={m} onPress={() => { if (!isFuture) updateDate(year, mIdx, day); }} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : 'transparent', alignItems: 'center' }}>
                            <Text style={{ color: isFuture ? T.text.muted : (active ? T.text.primary : T.text.secondary), fontSize: 14, fontFamily: 'SpaceMono-Regular' }}>{m}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>

              {/* Day */}
              <View>
                <Text style={{ ...L, marginBottom: 10 }}>DAY</Text>
                <View style={{ gap: 5 }}>
                  {dayRows.map((row, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', gap: 5 }}>
                      {row.map((d) => {
                        if (d > daysInMonth) return <View key={d} style={{ flex: 1 }} />;
                        const isFuture = year === today.getFullYear() && month === today.getMonth() + 1 && d > today.getDate();
                        const active = day === d;
                        return (
                          <Pressable key={d} onPress={() => { if (isFuture) return; updateDate(year, month, d); if (!active) setDatePickerOpen(false); }} style={{ flex: 1, paddingVertical: 10, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : 'transparent', alignItems: 'center' }}>
                            <Text style={{ color: isFuture ? T.text.muted : (active ? T.text.primary : T.text.secondary), fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>{d}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })()}
      </KeyboardAwareScrollView>

      {/* Sticky save button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: T.border }}>
        <Pressable
          onPress={onSave}
          disabled={isPending}
          style={{ backgroundColor: T.elevated, borderWidth: 1, borderColor: T.text.secondary, borderRadius: T.radius, paddingVertical: 16, alignItems: 'center', opacity: isPending ? 0.5 : 1 }}
        >
          {isPending
            ? <ActivityIndicator color={T.text.primary} />
            : <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 3 }}>[ SAVE ]</Text>
          }
        </Pressable>
      </View>
    </Sheet>
  );
}
