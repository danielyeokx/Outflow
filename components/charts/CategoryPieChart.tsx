import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { formatCurrency } from "../../lib/format";

interface Row {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
}

interface Props {
  data: Row[];
  total: number;
}

export default function CategoryPieChart({ data, total }: Props) {
  const pieData = data.map((row) => ({
    value: row.total,
    color: row.categoryColor,
    label: row.categoryName,
  }));

  return (
    <View className="bg-card rounded-2xl items-center py-5">
      <Text className="text-text-secondary text-sm font-semibold mb-4">
        Spending Breakdown
      </Text>
      <PieChart
        data={pieData}
        donut
        radius={100}
        innerRadius={62}
        innerCircleColor="#22222F"
        centerLabelComponent={() => (
          <View className="items-center">
            <Text className="text-text-muted text-xs">Total</Text>
            <Text className="text-text-primary text-base font-bold">
              {formatCurrency(total)}
            </Text>
          </View>
        )}
      />
      {/* Legend */}
      <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-4">
        {data.slice(0, 6).map((row) => (
          <View key={row.categoryId} className="flex-row items-center gap-1">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: row.categoryColor }}
            />
            <Text className="text-text-muted text-xs">{row.categoryName}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
