import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { todayISO, addMonths, formatCurrency } from "../../lib/format";
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
    const map: Record<string, {
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      categoryIcon: string;
      total: number;
    }> = {};
    for (const e of expenses) {
      if (!map[e.categoryId]) {
        map[e.categoryId] = {
          categoryId: e.categoryId,
          categoryName: e.categoryName,
          categoryColor: e.categoryColor,
          categoryIcon: e.categoryIcon,
          total: 0,
        };
      }
      map[e.categoryId].total += e.amountCents;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const dailyTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.spentAt] = (map[e.spentAt] ?? 0) + e.amountCents;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, total]) => ({ day, total }));
  }, [expenses]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#0F0F14' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }}>Outflow</Text>
          <Pressable
            onPress={() => router.push("/add")}
            style={{ backgroundColor: '#7C6FFF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={22} color="#FFF" />
          </Pressable>
        </View>

        {/* Month Switcher */}
        <MonthHeader
          monthISO={currentMonth}
          onPrev={() => setCurrentMonth((m) => addMonths(m, -1))}
          onNext={() => setCurrentMonth((m) => addMonths(m, 1))}
        />

        {/* Total */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ color: '#6B6B8A', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
            Total Spent
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' }}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>

        {/* Pie Chart */}
        {categoryRows.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <CategoryPieChart data={categoryRows} total={grandTotal} />
          </View>
        )}

        {/* Bar Chart */}
        {dailyTotals.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <MonthlyBarChart data={dailyTotals} />
          </View>
        )}

        {/* Category Breakdown */}
        {categoryRows.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            <Text style={{ color: '#A0A0C0', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
              By Category
            </Text>
            <CategoryBreakdown rows={categoryRows} total={grandTotal} />
          </View>
        )}

        {expenses.length === 0 && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Text style={{ color: '#6B6B8A', fontSize: 16, textAlign: 'center' }}>
              No expenses this month.{"\n"}Tap + to add one.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
