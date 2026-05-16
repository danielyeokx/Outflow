import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { formatCurrency } from "../../lib/format";
import { T, toGray } from "../../lib/theme";

interface Row {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
}

interface Props {
  data: Row[];
  total: number;
  currency: string;
}

export default function CategoryPieChart({ data, total, currency }: Props) {
  const pieData = data.map((row) => ({
    value: row.total,
    color: toGray(row.categoryColor),
  }));

  return (
    <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, paddingVertical: 20 }}>
      <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 16, paddingHorizontal: 14 }}>
        // SPENDING.BREAKDOWN
      </Text>
      <View style={{ alignItems: 'center' }}>
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={56}
          innerCircleColor={T.surface}
          centerLabelComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>TOTAL</Text>
              <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular', marginTop: 2 }}>
                {formatCurrency(total, currency)}
              </Text>
            </View>
          )}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16, paddingHorizontal: 14, gap: 8 }}>
          {data.map((row) => (
            <View key={row.categoryId} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 6, height: 6, backgroundColor: toGray(row.categoryColor) }} />
              <Text style={{ color: T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular' }}>
                {row.categoryName.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
