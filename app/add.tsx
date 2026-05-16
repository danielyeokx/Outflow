import { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, Pressable, Modal,
  ActivityIndicator, Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parseISO } from "date-fns";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseFormSchema, recurringFormSchema, ExpenseFormValues, RecurringFormValues } from "../lib/schema";
import { useCategories, useLearnedKeywords } from "../lib/queries";
import { useAddExpense, useAddRecurring } from "../lib/mutations";
import { suggestCategoryId } from "../lib/categorize";
import { todayISO } from "../lib/format";
import { T, input } from "../lib/theme";
import Sheet from "../components/Sheet";
import CategoryPicker from "../components/expense/CategoryPicker";

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

const L = { color: T.text.muted, fontSize: 10, letterSpacing: 2, fontFamily: 'SpaceMono-Regular' as const, marginBottom: 8 };

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const { data: categories = [] } = useCategories();
  const { data: learnedMap = {} } = useLearnedKeywords();
  const { mutate: addExpense, isPending: pendingSingle } = useAddExpense();
  const { mutate: addRecurring, isPending: pendingRecurring } = useAddRecurring();

  const [type, setType] = useState<"single" | "recurring">("single");
  const [amountDigits, setAmountDigits] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingDate, setPendingDate] = useState(new Date());
  const autoPickedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentYear = new Date().getFullYear();

  const singleForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { amountCents: 0, itemName: "", categoryId: "", spentAt: todayISO() },
  });

  const recurringForm = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: {
      amountCents: 0, itemName: "", categoryId: "",
      frequency: "monthly", dayOfMonth: undefined, dayOfWeek: 1,
      intervalDays: 30, monthOfYear: 1,
      expiryMonth: new Date().getMonth() + 1, expiryYear: currentYear + 1,
    },
  });

  const itemName = type === "single" ? singleForm.watch("itemName") : recurringForm.watch("itemName");
  const categoryId = type === "single" ? singleForm.watch("categoryId") : recurringForm.watch("categoryId");
  const frequency = recurringForm.watch("frequency");
  const expiryMonth = recurringForm.watch("expiryMonth") ?? new Date().getMonth() + 1;
  const expiryYear = recurringForm.watch("expiryYear") ?? currentYear + 1;

  function syncAmount(digits: string) {
    const cents = parseInt(digits || "0", 10);
    singleForm.setValue("amountCents", cents);
    recurringForm.setValue("amountCents", cents);
  }

  function syncItemName(val: string) {
    singleForm.setValue("itemName", val);
    recurringForm.setValue("itemName", val);
  }

  function syncCategory(id: string) {
    singleForm.setValue("categoryId", id);
    recurringForm.setValue("categoryId", id);
    autoPickedRef.current = false;
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!itemName) {
      if (autoPickedRef.current) { syncCategory(""); autoPickedRef.current = false; }
      return;
    }
    debounceRef.current = setTimeout(() => {
      const suggested = suggestCategoryId(itemName, learnedMap);
      if (suggested && (autoPickedRef.current || !categoryId)) {
        singleForm.setValue("categoryId", suggested);
        recurringForm.setValue("categoryId", suggested);
        autoPickedRef.current = true;
      }
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [itemName, learnedMap]);

  const isPending = pendingSingle || pendingRecurring;
  const errors = type === "single" ? singleForm.formState.errors : recurringForm.formState.errors;

  function onSubmit() {
    if (type === "single") {
      singleForm.handleSubmit((values) => {
        addExpense(values, { onSuccess: () => router.back(), onError: () => Alert.alert("Error", "Could not save expense.") });
      })();
    } else {
      recurringForm.handleSubmit((values) => {
        const payload = hasExpiry ? values : { ...values, expiryMonth: undefined, expiryYear: undefined };
        addRecurring(payload, { onSuccess: () => router.back(), onError: () => Alert.alert("Error", "Could not save recurring.") });
      })();
    }
  }

  return (
    <Sheet>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.INPUT</Text>
          <Text style={{ color: T.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>NEW ENTRY</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} color={T.text.secondary} />
        </Pressable>
      </View>
      <View style={{ height: 1, backgroundColor: T.border }} />

      {/* Scrollable form fields */}
      <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} extraScrollHeight={24} enableOnAndroid>

        {/* Amount */}
        <View>
          <Text style={L}>AMOUNT.SGD</Text>
          <TextInput
            style={{ ...input, fontSize: 26, fontFamily: 'SpaceMono-Regular', borderColor: errors.amountCents ? '#666' : T.border }}
            placeholder="> 0.00" placeholderTextColor={T.text.muted} keyboardType="number-pad"
            value={amountDigits ? `> ${formatDigits(amountDigits)}` : ""}
            onChangeText={(text) => { const d = text.replace(/\D/g, "").slice(-7); setAmountDigits(d); syncAmount(d); }}
          />
          {errors.amountCents && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.amountCents.message}</Text>}
        </View>

        {/* Item name */}
        <View>
          <Text style={L}>ITEM.NAME</Text>
          <TextInput
            style={{ ...input, fontSize: 26, fontFamily: 'SpaceMono-Regular', borderColor: errors.itemName ? '#666' : T.border }}
            placeholder="DESCRIBE EXPENSE..." placeholderTextColor={T.text.muted}
            value={itemName} onChangeText={syncItemName} returnKeyType="next"
          />
          {errors.itemName && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.itemName.message}</Text>}
        </View>

        {/* Category */}
        <View>
          <Text style={L}>CATEGORY</Text>
          <CategoryPicker categories={categories} value={categoryId || null} onChange={syncCategory} error={errors.categoryId?.message} />
        </View>

        {/* Date — single only */}
        {type === "single" && (
          <View>
            <Text style={L}>DATE</Text>
            <Controller control={singleForm.control} name="spentAt" render={({ field: { onChange, value } }) => (
              <>
                <Pressable
                  style={{ ...input, justifyContent: 'center' }}
                  onPress={() => {
                    setPendingDate(value ? parseISO(value) : new Date());
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={{ color: T.text.primary, fontSize: 14, fontFamily: 'SpaceMono-Regular' }}>{value}</Text>
                </Pressable>

                <Modal visible={showDatePicker} transparent animationType="fade">
                  <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' }} onPress={() => setShowDatePicker(false)} />
                  <View style={{ backgroundColor: T.bg, borderTopWidth: 1, borderTopColor: T.border, paddingBottom: insets.bottom }}>
                    <DateTimePicker
                      value={pendingDate}
                      mode="date"
                      display="inline"
                      themeVariant="dark"
                      maximumDate={new Date()}
                      onChange={(_, date) => { if (date) setPendingDate(date); }}
                      style={{ alignSelf: 'center' }}
                    />
                    <Pressable
                      onPress={() => { onChange(format(pendingDate, 'yyyy-MM-dd')); setShowDatePicker(false); }}
                      style={{ marginHorizontal: 20, marginTop: 4, marginBottom: 12, paddingVertical: 14, borderRadius: T.radius, backgroundColor: T.elevated, borderWidth: 1, borderColor: T.border, alignItems: 'center' }}
                    >
                      <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular', letterSpacing: 2 }}>CONFIRM</Text>
                    </Pressable>
                  </View>
                </Modal>
              </>
            )} />
          </View>
        )}

        {/* Type toggle */}
        <View>
          <Text style={L}>TYPE</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(["single", "recurring"] as const).map((t) => {
              const active = type === t;
              return (
                <Pressable key={t} onPress={() => setType(t)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}>
                  <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular', letterSpacing: 2 }}>{t === "single" ? "SINGLE" : "RECURRING"}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Recurring fields */}
        {type === "recurring" && (
          <>
            <View>
              <Text style={L}>FREQUENCY</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {FREQ_OPTIONS.map((opt) => {
                  const active = frequency === opt.value;
                  return (
                    <Pressable key={opt.value} onPress={() => recurringForm.setValue("frequency", opt.value)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}>
                      <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>{opt.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {(frequency === "monthly" || frequency === "yearly") && (
              <View>
                <Text style={L}>DAY OF MONTH</Text>
                <Controller control={recurringForm.control} name="dayOfMonth" render={({ field: { onChange, value } }) => (
                  <TextInput style={{ ...input, fontFamily: 'SpaceMono-Regular' }} placeholder="1–31" placeholderTextColor={T.text.muted} keyboardType="number-pad" value={value?.toString() ?? ""} onChangeText={(t) => { if (!t) { onChange(undefined); return; } const n = parseInt(t, 10); if (!isNaN(n)) onChange(Math.min(31, Math.max(1, n))); }} />
                )} />
              </View>
            )}

            {frequency === "weekly" && (
              <View>
                <Text style={L}>DAY OF WEEK</Text>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {DAYS_OF_WEEK.map((d, i) => {
                    const active = recurringForm.watch("dayOfWeek") === i;
                    return (
                      <Pressable key={d} onPress={() => recurringForm.setValue("dayOfWeek", i)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}>
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
                    const active = recurringForm.watch("monthOfYear") === i + 1;
                    return (
                      <Pressable key={m} onPress={() => recurringForm.setValue("monthOfYear", i + 1)} style={{ paddingVertical: 13, paddingHorizontal: 10, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface }}>
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
                <Controller control={recurringForm.control} name="intervalDays" render={({ field: { onChange, value } }) => (
                  <TextInput style={{ ...input, fontFamily: 'SpaceMono-Regular' }} placeholder="30" placeholderTextColor={T.text.muted} keyboardType="number-pad" value={value?.toString() ?? ""} onChangeText={(t) => onChange(Math.max(1, parseInt(t) || 1))} />
                )} />
              </View>
            )}

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
                    <Text style={{ ...L, marginBottom: 10 }}>MONTH</Text>
                    <View style={{ gap: 5 }}>
                      {[MONTHS_SHORT.slice(0, 6), MONTHS_SHORT.slice(6)].map((row, rowIdx) => (
                        <View key={rowIdx} style={{ flexDirection: 'row', gap: 5 }}>
                          {row.map((m, i) => {
                            const monthIdx = rowIdx * 6 + i;
                            const active = expiryMonth === monthIdx + 1;
                            return (
                              <Pressable key={m} onPress={() => recurringForm.setValue("expiryMonth", monthIdx + 1)} style={{ flex: 1, paddingVertical: 13, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : 'transparent', alignItems: 'center' }}>
                                <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 14, fontFamily: 'SpaceMono-Regular' }}>{m}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </View>
                  <View>
                    <Text style={{ ...L, marginBottom: 10 }}>YEAR</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Pressable onPress={() => recurringForm.setValue("expiryYear", Math.max(currentYear, expiryYear - 1))} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={16} color={T.text.secondary} />
                      </Pressable>
                      <Text style={{ color: T.text.primary, fontSize: 18, fontFamily: 'SpaceMono-Regular', flex: 1, textAlign: 'center' }}>{expiryYear}</Text>
                      <Pressable onPress={() => recurringForm.setValue("expiryYear", expiryYear + 1)} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={16} color={T.text.secondary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </KeyboardAwareScrollView>

      {/* Sticky confirm button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: T.border }}>
        <Pressable
          onPress={onSubmit}
          disabled={isPending}
          style={{ backgroundColor: T.elevated, borderWidth: 1, borderColor: T.text.secondary, borderRadius: T.radius, paddingVertical: 16, alignItems: 'center', opacity: isPending ? 0.5 : 1 }}
        >
          {isPending
            ? <ActivityIndicator color={T.text.primary} />
            : <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 3 }}>[ CONFIRM ]</Text>
          }
        </Pressable>
      </View>
    </Sheet>
  );
}
