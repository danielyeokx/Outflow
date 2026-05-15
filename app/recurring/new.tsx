import { useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recurringFormSchema, RecurringFormValues } from "../../lib/schema";
import { useCategories } from "../../lib/queries";
import { useAddRecurring } from "../../lib/mutations";
import CategoryPicker from "../../components/expense/CategoryPicker";
import { T, input } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";
import { todayISO, parseCurrencyInput } from "../../lib/format";

const FREQ_OPTIONS = [
  { value: "monthly", label: "MONTHLY" },
  { value: "weekly",  label: "WEEKLY"  },
  { value: "yearly",  label: "YEARLY"  },
  { value: "custom",  label: "CUSTOM"  },
] as const;

const DAYS_OF_WEEK = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function formatDigits(digits: string): string {
  if (!digits) return "";
  const padded = digits.padStart(3, "0");
  return `${String(parseInt(padded.slice(0, -2), 10))}.${padded.slice(-2)}`;
}

const labelStyle = { color: T.text.muted, fontSize: 10, letterSpacing: 2, fontFamily: 'SpaceMono-Regular' as const, marginBottom: 8 };

export default function NewRecurringScreen() {
  const { data: categories = [] } = useCategories();
  const { mutate: addRecurring, isPending } = useAddRecurring();
  const [amountDigits, setAmountDigits] = useState("");

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: {
      itemName: "",
      amountCents: 0,
      categoryId: "",
      frequency: "monthly",
      dayOfMonth: 1,
      dayOfWeek: 1,
      intervalDays: 30,
      monthOfYear: 1,
      startDate: todayISO(),
    },
  });

  const frequency = watch("frequency");

  function onSubmit(values: RecurringFormValues) {
    addRecurring(values, {
      onSuccess: () => router.back(),
      onError: () => Alert.alert("Error", "Could not save recurring expense."),
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.SCHEDULE</Text>
          <Text style={{ color: T.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>NEW RECURRING</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} color={T.text.secondary} />
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 20, marginBottom: 4 }} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 20, gap: 20 }}>

          {/* Amount */}
          <View>
            <Text style={labelStyle}>AMOUNT.SGD</Text>
            <Controller control={control} name="amountCents" render={({ field: { onChange } }) => (
              <TextInput
                style={{ ...input, fontSize: 26, fontFamily: 'SpaceMono-Regular', borderColor: errors.amountCents ? '#666' : T.border }}
                placeholder="> 0.00"
                placeholderTextColor={T.text.muted}
                keyboardType="number-pad"
                value={amountDigits ? `> ${formatDigits(amountDigits)}` : ""}
                onChangeText={(text) => {
                  const d = text.replace(/\D/g, "").slice(-7);
                  setAmountDigits(d);
                  onChange(parseInt(d || "0", 10));
                }}
              />
            )} />
            {errors.amountCents && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.amountCents.message}</Text>}
          </View>

          {/* Item name */}
          <View>
            <Text style={labelStyle}>ITEM.NAME</Text>
            <Controller control={control} name="itemName" render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={{ ...input, borderColor: errors.itemName ? '#666' : T.border }}
                placeholder="describe recurring expense..."
                placeholderTextColor={T.text.muted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )} />
            {errors.itemName && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.itemName.message}</Text>}
          </View>

          {/* Category */}
          <View>
            <Text style={labelStyle}>CATEGORY</Text>
            <Controller control={control} name="categoryId" render={({ field: { onChange, value } }) => (
              <CategoryPicker categories={categories} value={value || null} onChange={onChange} error={errors.categoryId?.message} />
            )} />
          </View>

          {/* Frequency */}
          <View>
            <Text style={labelStyle}>FREQUENCY</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {FREQ_OPTIONS.map((opt) => {
                const active = frequency === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setValue("frequency", opt.value)}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}
                  >
                    <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Conditional day selectors */}
          {frequency === "monthly" && (
            <View>
              <Text style={labelStyle}>DAY OF MONTH (1-31)</Text>
              <Controller control={control} name="dayOfMonth" render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ ...input, fontFamily: 'SpaceMono-Regular' }}
                  placeholder="1"
                  placeholderTextColor={T.text.muted}
                  keyboardType="number-pad"
                  value={value?.toString() ?? ""}
                  onChangeText={(t) => onChange(Math.min(31, Math.max(1, parseInt(t) || 1)))}
                />
              )} />
            </View>
          )}

          {frequency === "weekly" && (
            <View>
              <Text style={labelStyle}>DAY OF WEEK</Text>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                {DAYS_OF_WEEK.map((d, i) => {
                  const active = watch("dayOfWeek") === i;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setValue("dayOfWeek", i)}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface, alignItems: 'center' }}
                    >
                      <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 8, fontFamily: 'SpaceMono-Regular' }}>{d}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {frequency === "yearly" && (
            <View style={{ gap: 14 }}>
              <View>
                <Text style={labelStyle}>MONTH</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                  {MONTHS.map((m, i) => {
                    const active = watch("monthOfYear") === i + 1;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setValue("monthOfYear", i + 1)}
                        style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: T.radius, borderWidth: 1, borderColor: active ? T.text.secondary : T.border, backgroundColor: active ? T.elevated : T.surface }}
                      >
                        <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' }}>{m}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View>
                <Text style={labelStyle}>DAY OF MONTH (1-31)</Text>
                <Controller control={control} name="dayOfMonth" render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={{ ...input, fontFamily: 'SpaceMono-Regular' }}
                    placeholder="1"
                    placeholderTextColor={T.text.muted}
                    keyboardType="number-pad"
                    value={value?.toString() ?? ""}
                    onChangeText={(t) => onChange(Math.min(31, Math.max(1, parseInt(t) || 1)))}
                  />
                )} />
              </View>
            </View>
          )}

          {frequency === "custom" && (
            <View>
              <Text style={labelStyle}>REPEAT EVERY N DAYS</Text>
              <Controller control={control} name="intervalDays" render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ ...input, fontFamily: 'SpaceMono-Regular' }}
                  placeholder="30"
                  placeholderTextColor={T.text.muted}
                  keyboardType="number-pad"
                  value={value?.toString() ?? ""}
                  onChangeText={(t) => onChange(Math.max(1, parseInt(t) || 1))}
                />
              )} />
            </View>
          )}

          {/* Start date */}
          <View>
            <Text style={labelStyle}>START.DATE</Text>
            <Controller control={control} name="startDate" render={({ field: { onChange, value } }) => (
              <TextInput
                style={{ ...input, fontFamily: 'SpaceMono-Regular' }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={T.text.muted}
                value={value}
                onChangeText={onChange}
                keyboardType="numbers-and-punctuation"
              />
            )} />
          </View>

          {/* End date */}
          <View>
            <Text style={labelStyle}>END.DATE (OPTIONAL)</Text>
            <Controller control={control} name="endDate" render={({ field: { onChange, value } }) => (
              <TextInput
                style={{ ...input, fontFamily: 'SpaceMono-Regular' }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={T.text.muted}
                value={value ?? ""}
                onChangeText={(t) => onChange(t || undefined)}
                keyboardType="numbers-and-punctuation"
              />
            )} />
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            style={{ backgroundColor: T.elevated, borderWidth: 1, borderColor: T.text.secondary, borderRadius: T.radius, paddingVertical: 16, alignItems: 'center', marginTop: 4, opacity: isPending ? 0.5 : 1, marginBottom: 40 }}
          >
            {isPending
              ? <ActivityIndicator color={T.text.primary} />
              : <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 3 }}>[ SAVE RECURRING ]</Text>
            }
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
