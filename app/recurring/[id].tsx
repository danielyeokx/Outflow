import { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, Pressable,
  ActivityIndicator, Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router, useLocalSearchParams } from "expo-router";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recurringFormSchema, RecurringFormValues } from "../../lib/schema";
import { useCategories, useLearnedKeywords } from "../../lib/queries";
import { useRecurring } from "../../lib/queries";
import { useUpdateRecurring, useDeleteRecurring } from "../../lib/mutations";
import { suggestCategoryId } from "../../lib/categorize";
import { CURRENCIES } from "../../lib/rates";
import { T, input } from "../../lib/theme";
import Sheet from "../../components/Sheet";
import CategoryPicker from "../../components/expense/CategoryPicker";

const DEBOUNCE_MS = 400;

const FREQ_OPTIONS = [
  { value: "monthly", label: "MONTHLY" },
  { value: "weekly",  label: "WEEKLY"  },
  { value: "yearly",  label: "YEARLY"  },
  { value: "custom",  label: "CUSTOM"  },
] as const;
const DAYS_OF_WEEK = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const MONTHS_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function formatDigits(d: string): string {
  if (!d) return "";
  const p = d.padStart(3, "0");
  return `${String(parseInt(p.slice(0, -2), 10))}.${p.slice(-2)}`;
}

function centsToDigits(cents: number): string {
  return cents > 0 ? String(cents) : "";
}

const L = { color: T.text.muted, fontSize: 10, letterSpacing: 2, fontFamily: 'SpaceMono-Regular' as const, marginBottom: 8 };

export default function EditRecurringScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: items = [] } = useRecurring();
  const { data: categories = [] } = useCategories();
  const { data: learnedMap = {} } = useLearnedKeywords();
  const { mutate: updateRecurring, isPending: pendingUpdate } = useUpdateRecurring();
  const { mutate: deleteRecurring, isPending: pendingDelete } = useDeleteRecurring();

  const item = items.find((i) => i.id === id);
  const currentYear = new Date().getFullYear();

  // Parse existing end date into expiryMonth/Year
  function parseEndDate(endDate: string | null | undefined) {
    if (!endDate) return { month: undefined as number | undefined, year: undefined as number | undefined, hasExpiry: false };
    const parts = endDate.split("-");
    if (parts.length < 2) return { month: undefined, year: undefined, hasExpiry: false };
    return { month: parseInt(parts[1], 10), year: parseInt(parts[0], 10), hasExpiry: true };
  }

  const parsed = item ? parseEndDate(item.endDate) : { month: undefined, year: undefined, hasExpiry: false };

  const [amountDigits, setAmountDigits] = useState(() =>
    item ? centsToDigits(item.amountCents) : ""
  );
  const [dayText, setDayText] = useState(() =>
    item?.dayOfMonth != null ? String(item.dayOfMonth) : ""
  );
  const [currency, setCurrencyState] = useState(() => item?.currency ?? "SGD");
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(parsed.hasExpiry);
  const initialised = useRef(false);
  const autoPickedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: item ? {
      amountCents: item.amountCents,
      itemName: item.itemName,
      categoryId: item.categoryId,
      frequency: item.frequency as RecurringFormValues["frequency"],
      dayOfMonth: item.dayOfMonth ?? undefined,
      dayOfWeek: item.dayOfWeek ?? undefined,
      intervalDays: item.intervalDays ?? undefined,
      monthOfYear: item.monthOfYear ?? undefined,
      expiryMonth: parsed.month ?? (new Date().getMonth() + 1),
      expiryYear: parsed.year ?? (currentYear + 1),
    } : {
      amountCents: 0, itemName: "", categoryId: "",
      frequency: "monthly", dayOfMonth: undefined, dayOfWeek: 1,
      intervalDays: 30, monthOfYear: 1,
      expiryMonth: new Date().getMonth() + 1, expiryYear: currentYear + 1,
    },
  });

  // Re-init if item loads after mount (query hydration)
  useEffect(() => {
    if (item && !initialised.current) {
      initialised.current = true;
      autoPickedRef.current = true; // treat existing category as auto-associated so clear-name clears it
      const p = parseEndDate(item.endDate);
      setAmountDigits(centsToDigits(item.amountCents));
      setDayText(item.dayOfMonth != null ? String(item.dayOfMonth) : "");
      setCurrencyState(item.currency ?? "SGD");
      setHasExpiry(p.hasExpiry);
      form.reset({
        amountCents: item.amountCents,
        itemName: item.itemName,
        categoryId: item.categoryId,
        frequency: item.frequency as RecurringFormValues["frequency"],
        dayOfMonth: item.dayOfMonth ?? undefined,
        dayOfWeek: item.dayOfWeek ?? undefined,
        intervalDays: item.intervalDays ?? undefined,
        monthOfYear: item.monthOfYear ?? undefined,
        expiryMonth: p.month ?? (new Date().getMonth() + 1),
        expiryYear: p.year ?? (currentYear + 1),
      });
    }
  }, [item]);

  const itemName = form.watch("itemName");
  const categoryId = form.watch("categoryId");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!itemName) {
      if (autoPickedRef.current) { form.setValue("categoryId", ""); autoPickedRef.current = false; }
      return;
    }
    debounceRef.current = setTimeout(() => {
      const suggested = suggestCategoryId(itemName, learnedMap);
      if (suggested && (autoPickedRef.current || !categoryId)) {
        form.setValue("categoryId", suggested);
        autoPickedRef.current = true;
      }
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [itemName, learnedMap]);

  const frequency = form.watch("frequency");
  const expiryMonth = form.watch("expiryMonth") ?? new Date().getMonth() + 1;
  const expiryYear = form.watch("expiryYear") ?? currentYear + 1;
  const errors = form.formState.errors;
  const isPending = pendingUpdate || pendingDelete;

  function onSubmit() {
    form.setValue("currency", currency);
    form.handleSubmit((values) => {
      const payload = hasExpiry ? values : { ...values, expiryMonth: undefined, expiryYear: undefined };
      updateRecurring(
        { id: id!, values: payload },
        { onSuccess: () => router.back(), onError: () => Alert.alert("Error", "Could not update recurring expense.") }
      );
    })();
  }

  function onDelete() {
    Alert.alert("Delete recurring?", `"${item?.itemName}" will stop auto-logging.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => deleteRecurring(id!, { onSuccess: () => router.back() }),
      },
    ]);
  }

  if (!item) {
    return (
      <Sheet>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={T.text.secondary} />
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.SCHEDULE</Text>
          <Text style={{ color: T.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>EDIT RECURRING</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={onDelete} disabled={isPending} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={15} color={T.text.muted} />
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={T.text.secondary} />
          </Pressable>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: T.border }} />

      <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} extraScrollHeight={24} enableOnAndroid>

        {/* Amount */}
        <View>
          <Text style={L}>AMOUNT</Text>
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 8 }}>
            <TextInput
              style={{ ...input, flex: 1, fontSize: 26, fontFamily: 'SpaceMono-Regular', borderColor: errors.amountCents ? '#666' : T.border }}
              placeholder="> 0.00" placeholderTextColor={T.text.muted} keyboardType="number-pad"
              value={amountDigits ? `> ${formatDigits(amountDigits)}` : ""}
              onChangeText={(text) => {
                const d = text.replace(/\D/g, "").slice(-7);
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
          <Controller control={form.control} name="itemName" render={({ field: { onChange, value } }) => (
            <TextInput
              style={{ ...input, fontSize: 26, fontFamily: 'SpaceMono-Regular', borderColor: errors.itemName ? '#666' : T.border }}
              placeholder="DESCRIBE EXPENSE..." placeholderTextColor={T.text.muted}
              value={value} onChangeText={onChange}
            />
          )} />
          {errors.itemName && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.itemName.message}</Text>}
        </View>

        {/* Category */}
        <View>
          <Text style={L}>CATEGORY</Text>
          <Controller control={form.control} name="categoryId" render={({ field: { onChange, value } }) => (
            <CategoryPicker categories={categories} value={value || null} onChange={onChange} error={errors.categoryId?.message} />
          )} />
        </View>

        {/* Frequency */}
        <View>
          <Text style={L}>FREQUENCY</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FREQ_OPTIONS.map((opt) => {
              const active = frequency === opt.value;
              return (
                <Pressable key={opt.value} onPress={() => form.setValue("frequency", opt.value)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}>
                  <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {(frequency === "monthly" || frequency === "yearly") && (
          <View>
            <Text style={L}>DAY OF MONTH</Text>
            <TextInput
              style={{ ...input, fontFamily: 'SpaceMono-Regular' }}
              placeholder="1–31" placeholderTextColor={T.text.muted} keyboardType="number-pad"
              value={dayText}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, "");
                setDayText(digits);
                if (!digits) { form.setValue("dayOfMonth", undefined); return; }
                const n = parseInt(digits, 10);
                if (!isNaN(n)) form.setValue("dayOfMonth", Math.min(31, n));
              }}
            />
          </View>
        )}

        {frequency === "weekly" && (
          <View>
            <Text style={L}>DAY OF WEEK</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {DAYS_OF_WEEK.map((d, i) => {
                const active = form.watch("dayOfWeek") === i;
                return (
                  <Pressable key={d} onPress={() => form.setValue("dayOfWeek", i)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}>
                    <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular' }}>{d}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {frequency === "yearly" && (
          <View>
            <Text style={L}>MONTH OF YEAR</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
              {MONTHS_SHORT.map((m, i) => {
                const active = form.watch("monthOfYear") === i + 1;
                return (
                  <Pressable key={m} onPress={() => form.setValue("monthOfYear", i + 1)} style={{ paddingVertical: 13, paddingHorizontal: 10, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface }}>
                    <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular' }}>{m}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {frequency === "custom" && (
          <View>
            <Text style={L}>REPEAT EVERY N DAYS</Text>
            <Controller control={form.control} name="intervalDays" render={({ field: { onChange, value } }) => (
              <TextInput style={{ ...input, fontFamily: 'SpaceMono-Regular' }} placeholder="30" placeholderTextColor={T.text.muted} keyboardType="number-pad" value={value?.toString() ?? ""} onChangeText={(t) => onChange(Math.max(1, parseInt(t) || 1))} />
            )} />
          </View>
        )}

        {/* Expires */}
        <View>
          <Text style={L}>EXPIRES</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: hasExpiry ? 12 : 0 }}>
            {[false, true].map((val) => {
              const active = hasExpiry === val;
              return (
                <Pressable key={String(val)} onPress={() => setHasExpiry(val)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}>
                  <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>{val ? "UNTIL" : "FOREVER"}</Text>
                </Pressable>
              );
            })}
          </View>
          {hasExpiry && (
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, gap: 14 }}>
              <View>
                <Text style={{ ...L, marginBottom: 10 }}>YEAR</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable onPress={() => form.setValue("expiryYear", Math.max(currentYear, expiryYear - 1))} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={16} color={T.text.secondary} />
                  </Pressable>
                  <Text style={{ color: T.text.primary, fontSize: 18, fontFamily: 'SpaceMono-Regular', flex: 1, textAlign: 'center' }}>{expiryYear}</Text>
                  <Pressable onPress={() => form.setValue("expiryYear", expiryYear + 1)} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={16} color={T.text.secondary} />
                  </Pressable>
                </View>
              </View>
              <View>
                <Text style={{ ...L, marginBottom: 10 }}>MONTH</Text>
                <View style={{ gap: 5 }}>
                  {[MONTHS_SHORT.slice(0, 6), MONTHS_SHORT.slice(6)].map((row, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', gap: 5 }}>
                      {row.map((m, i) => {
                        const monthIdx = rowIdx * 6 + i;
                        const active = expiryMonth === monthIdx + 1;
                        return (
                          <Pressable key={m} onPress={() => form.setValue("expiryMonth", monthIdx + 1)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : 'transparent', alignItems: 'center' }}>
                            <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular' }}>{m}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

      </KeyboardAwareScrollView>

      {/* Sticky update button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: T.border }}>
        <Pressable
          onPress={onSubmit}
          disabled={isPending}
          style={{ backgroundColor: T.elevated, borderWidth: 1, borderColor: T.text.secondary, borderRadius: T.radius, paddingVertical: 16, alignItems: 'center', opacity: isPending ? 0.5 : 1 }}
        >
          {isPending
            ? <ActivityIndicator color={T.text.primary} />
            : <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 3 }}>[ UPDATE ]</Text>
          }
        </Pressable>
      </View>
    </Sheet>
  );
}
