import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseFormSchema, ExpenseFormValues } from "../../lib/schema";
import { useCategories, useLearnedKeywords } from "../../lib/queries";
import { useAddExpense } from "../../lib/mutations";
import { suggestCategoryId } from "../../lib/categorize";
import { todayISO } from "../../lib/format";
import CategoryPicker from "./CategoryPicker";

const DEBOUNCE_MS = 400;

interface Props {
  onSuccess: () => void;
}

function formatDigits(digits: string): string {
  if (!digits) return "";
  const padded = digits.padStart(3, "0");
  const whole = String(parseInt(padded.slice(0, -2), 10));
  const dec = padded.slice(-2);
  return `${whole}.${dec}`;
}

export default function ExpenseForm({ onSuccess }: Props) {
  const { data: categories = [] } = useCategories();
  const { data: learnedMap = {} } = useLearnedKeywords();
  const { mutate: addExpense, isPending } = useAddExpense();

  const [amountDigits, setAmountDigits] = useState("");
  // Tracks whether the current category was set by auto-suggestion (vs manually chosen)
  const autoPickedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amountCents: 0,
      itemName: "",
      categoryId: "",
      spentAt: todayISO(),
    },
  });

  const itemName = watch("itemName");

  useEffect(() => {
    // Clear any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!itemName) {
      // Item cleared — reset category if it was auto-picked
      if (autoPickedRef.current) {
        setValue("categoryId", "");
        autoPickedRef.current = false;
      }
      return;
    }

    // Debounce: wait 400ms after user stops typing before suggesting
    debounceRef.current = setTimeout(() => {
      const suggested = suggestCategoryId(itemName, learnedMap);
      if (suggested && autoPickedRef.current !== false) {
        // Only auto-pick if category is blank OR was previously auto-picked
        setValue("categoryId", suggested);
        autoPickedRef.current = true;
      } else if (suggested && !watch("categoryId")) {
        setValue("categoryId", suggested);
        autoPickedRef.current = true;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [itemName, learnedMap]);

  function onSubmit(values: ExpenseFormValues) {
    addExpense(values, { onSuccess });
  }

  return (
    <View style={{ paddingVertical: 16, gap: 16 }}>
      {/* Amount */}
      <View>
        <Text style={{ color: '#A0A0C0', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
          Amount (SGD)
        </Text>
        <Controller
          control={control}
          name="amountCents"
          render={({ field: { onChange } }) => (
            <TextInput
              style={{
                backgroundColor: '#22222F',
                color: '#FFFFFF',
                fontSize: 28,
                fontWeight: 'bold',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderWidth: errors.amountCents ? 1 : 0,
                borderColor: errors.amountCents ? '#ef4444' : 'transparent',
              }}
              placeholder="0.00"
              placeholderTextColor="#6B6B8A"
              keyboardType="number-pad"
              value={formatDigits(amountDigits)}
              onChangeText={(text) => {
                const newDigits = text.replace(/\D/g, "").slice(-7);
                setAmountDigits(newDigits);
                onChange(parseInt(newDigits || "0", 10));
              }}
            />
          )}
        />
        {errors.amountCents && (
          <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
            {errors.amountCents.message}
          </Text>
        )}
      </View>

      {/* Item Name */}
      <View>
        <Text style={{ color: '#A0A0C0', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
          Item
        </Text>
        <Controller
          control={control}
          name="itemName"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={{
                backgroundColor: '#22222F',
                color: '#FFFFFF',
                fontSize: 16,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderWidth: errors.itemName ? 1 : 0,
                borderColor: errors.itemName ? '#ef4444' : 'transparent',
              }}
              placeholder="What did you spend on?"
              placeholderTextColor="#6B6B8A"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              returnKeyType="next"
            />
          )}
        />
        {errors.itemName && (
          <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
            {errors.itemName.message}
          </Text>
        )}
      </View>

      {/* Category */}
      <View>
        <Text style={{ color: '#A0A0C0', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
          Category
        </Text>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <CategoryPicker
              categories={categories}
              value={value || null}
              onChange={(id) => {
                onChange(id);
                // Mark as manually chosen — don't override on next keystroke
                autoPickedRef.current = false;
              }}
              error={errors.categoryId?.message}
            />
          )}
        />
      </View>

      {/* Date */}
      <View>
        <Text style={{ color: '#A0A0C0', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
          Date
        </Text>
        <Controller
          control={control}
          name="spentAt"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{
                backgroundColor: '#22222F',
                color: '#FFFFFF',
                fontSize: 16,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6B6B8A"
              value={value}
              onChangeText={onChange}
              keyboardType="numbers-and-punctuation"
            />
          )}
        />
        {errors.spentAt && (
          <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
            {errors.spentAt.message}
          </Text>
        )}
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        style={{
          backgroundColor: '#7C6FFF',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          marginTop: 8,
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
            Add Expense
          </Text>
        )}
      </Pressable>
    </View>
  );
}
