import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/format";

interface Row {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
}

interface Props {
  rows: Row[];
  total: number;
}

export default function CategoryBreakdown({ rows, total }: Props) {
  return (
    <View className="bg-card rounded-2xl overflow-hidden">
      {rows.map((row, index) => {
        const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
        return (
          <View
            key={row.categoryId}
            className={`px-4 py-3 ${index < rows.length - 1 ? "border-b border-border" : ""}`}
          >
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: row.categoryColor }}
                />
                <Text className="text-text-primary text-sm">{row.categoryName}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-text-muted text-xs">{pct}%</Text>
                <Text className="text-text-primary text-sm font-semibold">
                  {formatCurrency(row.total)}
                </Text>
              </View>
            </View>
            {/* Progress bar */}
            <View className="h-1 bg-border rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: row.categoryColor,
                  width: `${pct}%`,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
