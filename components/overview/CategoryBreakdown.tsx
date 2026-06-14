import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/format";
import { T, getCategoryColor } from "../../lib/theme";
import { useColorTheme } from "../../lib/queries";

interface Row {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryColorOverride?: string | null;
  categoryIcon: string;
  total: number;
}

interface Props {
  rows: Row[];
  total: number;
  currency: string;
}

export default function CategoryBreakdown({ rows, total, currency }: Props) {
  const { data: colorTheme = "neutral" } = useColorTheme();
  return (
    <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
      {rows.map((row, index) => {
        const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
        const gray = getCategoryColor(row.categoryColor, colorTheme, row.categoryColorOverride);
        return (
          <View
            key={row.categoryId}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderBottomWidth: index < rows.length - 1 ? 1 : 0,
              borderBottomColor: T.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 6, height: 6, backgroundColor: gray }} />
                <Text style={{ color: T.text.primary, fontSize: 13 }}>{row.categoryName}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular' }}>{pct}%</Text>
                <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular' }}>
                  {formatCurrency(row.total, currency)}
                </Text>
              </View>
            </View>
            {/* Progress bar */}
            <View style={{ height: 1, backgroundColor: T.border }}>
              <View style={{ height: 1, backgroundColor: gray, width: `${pct}%` }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
