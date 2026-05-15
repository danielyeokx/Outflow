import { useState } from "react";
import { View, Text, SectionList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { todayISO, addMonths, formatDate } from "../../lib/format";
import { T } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";
import PageHeader from "../../components/PageHeader";
import MonthHeader from "../../components/overview/MonthHeader";
import { useExpenses } from "../../lib/queries";
import { useDeleteExpense } from "../../lib/mutations";
import ExpenseListItem from "../../components/expense/ExpenseListItem";

export default function ExpensesScreen() {
  const [currentMonth, setCurrentMonth] = useState(todayISO());
  const { data: expenses = [], isLoading } = useExpenses(currentMonth);
  const { mutate: deleteExpense } = useDeleteExpense();

  const grouped = expenses.reduce<Record<string, typeof expenses>>((acc, e) => {
    if (!acc[e.spentAt]) acc[e.spentAt] = [];
    acc[e.spentAt].push(e);
    return acc;
  }, {});

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatDate(date), data }));

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete?", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteExpense(id) },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      {/* Sticky header */}
      <PageHeader sys="SYS.LOG" title="EXPENSES" />
      <MonthHeader
        monthISO={currentMonth}
        onPrev={() => setCurrentMonth(m => addMonths(m, -1))}
        onNext={() => setCurrentMonth(m => addMonths(m, 1))}
      />
      <View style={{ height: 1, backgroundColor: T.border }} />

      {/* Scrollable content */}
      {sections.length === 0 && !isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: T.text.muted, fontSize: 12, letterSpacing: 2, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }}>
            {'[ NO DATA ]\n\nTap + to log an expense.'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ paddingVertical: 8, marginTop: 4 }}>
              <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>
                {`// ${title.toUpperCase()}`}
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
