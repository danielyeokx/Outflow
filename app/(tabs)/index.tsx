import { useState } from "react";
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
import { useMonthlySummary, useDailyTotals, useDefaultCurrency } from "../../lib/queries";

export default function OverviewScreen() {
  const [currentMonth, setCurrentMonth] = useState(todayISO());
  const { data: summary } = useMonthlySummary(currentMonth);
  const { data: dailyTotals = [] } = useDailyTotals(currentMonth);
  const { data: defaultCurrency = "SGD" } = useDefaultCurrency();

  const categoryRows = summary?.rows ?? [];
  const grandTotal = summary?.grandTotal ?? 0;
  const isEmpty = grandTotal === 0 && dailyTotals.length === 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      <PageHeader sys="SYS.OVERVIEW" title="OUTFLOW" />
      <MonthHeader
        monthISO={currentMonth}
        onPrev={() => setCurrentMonth(m => addMonths(m, -1))}
        onNext={() => setCurrentMonth(m => addMonths(m, 1))}
      />
      <View style={{ height: 1, backgroundColor: T.border }} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Total readout */}
        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 20, padding: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 6 }}>TOTAL.SPENT</Text>
          <Text style={{ color: T.text.primary, fontSize: 32, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>
            {`> ${formatCurrency(grandTotal, defaultCurrency)}`}
          </Text>
        </View>

        {categoryRows.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <CategoryPieChart data={categoryRows} total={grandTotal} currency={defaultCurrency} />
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
            <CategoryBreakdown rows={categoryRows} total={grandTotal} currency={defaultCurrency} />
          </View>
        )}

        {isEmpty && (
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
