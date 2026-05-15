import { useState } from "react";
import {
  View,
  Text,
  SectionList,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import { todayISO, addMonths, formatDate, formatCurrency } from "../../lib/format";
import MonthHeader from "../../components/overview/MonthHeader";
import { useExpenses } from "../../lib/queries";
import { useDeleteExpense } from "../../lib/mutations";
import ExpenseListItem from "../../components/expense/ExpenseListItem";
import { format, parseISO } from "date-fns";

export default function ExpensesScreen() {
  const [currentMonth, setCurrentMonth] = useState(todayISO());
  const { data: expenses = [], isLoading } = useExpenses(currentMonth);
  const { mutate: deleteExpense } = useDeleteExpense();

  const grouped = expenses.reduce<Record<string, typeof expenses>>((acc, e) => {
    const day = e.spentAt;
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {});

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({
      title: formatDate(date),
      data,
    }));

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete expense?", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteExpense(id),
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background" style={{ flex: 1, backgroundColor: '#0F0F14' }}>
      <View className="px-5 pt-6 pb-2 flex-row items-center justify-between">
        <Text className="text-text-primary text-2xl font-bold">Expenses</Text>
        <Pressable
          onPress={() => router.push("/add")}
          className="bg-primary w-10 h-10 rounded-full items-center justify-center"
        >
          <Plus size={22} color="#FFF" />
        </Pressable>
      </View>

      <MonthHeader
        monthISO={currentMonth}
        onPrev={() => setCurrentMonth((m) => addMonths(m, -1))}
        onNext={() => setCurrentMonth((m) => addMonths(m, 1))}
      />

      {sections.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted text-base text-center">
            No expenses this month.{"\n"}Tap + to add one.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          renderSectionHeader={({ section: { title } }) => (
            <View className="py-2 mt-3">
              <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest">
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ExpenseListItem
              expense={item}
              onDelete={() => confirmDelete(item.id, item.itemName)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
