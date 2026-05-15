import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseFormSchema, ExpenseFormValues } from "../../lib/schema";
import { useCategories, useLearnedKeywords } from "../../lib/queries";
import { useAddExpense } from "../../lib/mutations";
import { suggestCategoryId } from "../../lib/categorize";
import { todayISO } from "../../lib/format";
import { T, input } from "../../lib/theme";
import CategoryPicker from "./CategoryPicker";

const DEBOUNCE_MS = 400;

interface Props {
  onSuccess: () => void;
}

function formatDigits(digits: string): string {
  if (!digits) return "";
  const padded = digits.padStart(3, "0");
  const whole = String(parseInt(padded.slice(0, -2), 10));
  return `${whole}.${padded.slice(-2)}`;
}

export default function ExpenseForm({ onSuccess }: Props) {
  const { data: categories = [] } = useCategories();
  const { data: learnedMap = {} } = useLearnedKeywords();
  const { mutate: addExpense, isPending } = useAddExpense();

  const [amountDigits, setAmountDigits] = useState("");
  const autoPickedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { amountCents: 0, itemName: "", categoryId: "", spentAt: todayISO() },
  });

  const itemName = watch("itemName");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!itemName) {
      if (autoPickedRef.current) { setValue("categoryId", ""); autoPickedRef.current = false; }
      return;
    }
    debounceRef.current = setTimeout(() => {
      const suggested = suggestCategoryId(itemName, learnedMap);
      if (suggested && (autoPickedRef.current || !watch("categoryId"))) {
        setValue("categoryId", suggested);
        autoPickedRef.current = true;
      }
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [itemName, learnedMap]);

  function onSubmit(values: ExpenseFormValues) {
    addExpense(values, { onSuccess });
  }

  const labelStyle = { color: T.text.muted, fontSize: 10, letterSpacing: 2, fontFamily: 'SpaceMono-Regular' as const, marginBottom: 8 };

  return (
    <View style={{ paddingVertical: 20, gap: 18 }}>

      {/* Amount */}
      <View>
        <Text style={labelStyle}>AMOUNT.SGD</Text>
        <Controller
          control={control}
          name="amountCents"
          render={({ field: { onChange } }) => (
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
          )}
        />
        {errors.amountCents && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.amountCents.message}</Text>}
      </View>

      {/* Item */}
      <View>
        <Text style={labelStyle}>ITEM.NAME</Text>
        <Controller
          control={control}
          name="itemName"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={{ ...input, borderColor: errors.itemName ? '#666' : T.border }}
              placeholder="describe transaction..."
              placeholderTextColor={T.text.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              returnKeyType="next"
            />
          )}
        />
        {errors.itemName && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.itemName.message}</Text>}
      </View>

      {/* Category */}
      <View>
        <Text style={labelStyle}>CATEGORY</Text>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <CategoryPicker
              categories={categories}
              value={value || null}
              onChange={(id) => { onChange(id); autoPickedRef.current = false; }}
              error={errors.categoryId?.message}
            />
          )}
        />
      </View>

      {/* Date */}
      <View>
        <Text style={labelStyle}>DATE</Text>
        <Controller
          control={control}
          name="spentAt"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{ ...input, fontFamily: 'SpaceMono-Regular', borderColor: errors.spentAt ? '#666' : T.border }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={T.text.muted}
              value={value}
              onChangeText={onChange}
              keyboardType="numbers-and-punctuation"
            />
          )}
        />
        {errors.spentAt && <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>{errors.spentAt.message}</Text>}
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        style={{ backgroundColor: T.elevated, borderWidth: 1, borderColor: T.text.secondary, borderRadius: T.radius, paddingVertical: 16, alignItems: 'center', marginTop: 4, opacity: isPending ? 0.5 : 1 }}
      >
        {isPending ? (
          <ActivityIndicator color={T.text.primary} />
        ) : (
          <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 3 }}>[ CONFIRM ]</Text>
        )}
      </Pressable>
    </View>
  );
}
