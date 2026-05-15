import { useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrency, todayISO, addMonths } from "../../lib/format";
import { T } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";
import PageHeader from "../../components/PageHeader";
import MonthHeader from "../../components/overview/MonthHeader";
import CategoryBreakdown from "../../components/overview/CategoryBreakdown";
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import MonthlyBarChart from "../../components/charts/MonthlyBarChart";
import { useExpenses } from "../../lib/queries";

export default function OverviewScreen() {
  const [currentMonth, setCurrentMonth] = useState(todayISO());
  const { data: expenses = [] } = useExpenses(currentMonth);

  const grandTotal = useMemo(
    () => expenses.reduce((acc, e) => acc + e.amountCents, 0),
    [expenses]
  );

  const categoryRows = useMemo(() => {
    const map: Record<string, { categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string; total: number }> = {};
    for (const e of expenses) {
      if (!map[e.categoryId]) map[e.categoryId] = { categoryId: e.categoryId, categoryName: e.categoryName, categoryColor: e.categoryColor, categoryIcon: e.categoryIcon, total: 0 };
      map[e.categoryId].total += e.amountCents;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const dailyTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) map[e.spentAt] = (map[e.spentAt] ?? 0) + e.amountCents;
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([day, total]) => ({ day, total }));
  }, [expenses]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      {/* Sticky header */}
      <PageHeader sys="SYS.OVERVIEW" title="OUTFLOW" />
      <MonthHeader
        monthISO={currentMonth}
        onPrev={() => setCurrentMonth(m => addMonths(m, -1))}
        onNext={() => setCurrentMonth(m => addMonths(m, 1))}
      />
      <View style={{ height: 1, backgroundColor: T.border }} />

      {/* Scrollable content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Total readout */}
        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 20, padding: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 6 }}>TOTAL.SPENT</Text>
          <Text style={{ color: T.text.primary, fontSize: 32, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>
            {`> SGD ${(grandTotal / 100).toFixed(2)}`}
          </Text>
        </View>

        {categoryRows.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <CategoryPieChart data={categoryRows} total={grandTotal} />
          </View>
        )}

        {dailyTotals.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <MonthlyBarChart data={dailyTotals} />
          </View>
        )}

        {categoryRows.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>// CATEGORY.BREAKDOWN</Text>
            <CategoryBreakdown rows={categoryRows} total={grandTotal} />
          </View>
        )}

        {expenses.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ color: T.text.muted, fontSize: 12, letterSpacing: 2, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }}>
              {'[ NO DATA ]\n\nTap + to log an expense.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
