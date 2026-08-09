import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { T, getCategoryColor, spendIntensityToGray } from "../../lib/theme";
import { calendarGridDays, formatDate, formatCurrency } from "../../lib/format";
import { useColorTheme, useWeekStartsOn, DayCategoryTotal } from "../../lib/queries";

interface DayTotal {
  day: string;
  total: number;
  categories: DayCategoryTotal[];
}

interface Props {
  monthISO: string;
  data: DayTotal[];
  currency: string;
}

const SUNDAY_FIRST_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONDAY_FIRST_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const GAP = 4;

export default function MonthlyHeatmap({ monthISO, data, currency }: Props) {
  const [gridWidth, setGridWidth] = useState(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const { data: colorTheme = "neutral" } = useColorTheme();
  const { data: weekStartsOn = 0 } = useWeekStartsOn();

  const cells = calendarGridDays(monthISO, weekStartsOn);
  const weekdayLabels = weekStartsOn === 1 ? MONDAY_FIRST_LABELS : SUNDAY_FIRST_LABELS;
  const cellSize = gridWidth > 0 ? (gridWidth - 14 * 2 - GAP * 6) / 7 : 0;

  const dayMap = new Map(data.map((d) => [d.day, d]));
  const nonZeroTotals = data.map((d) => d.total).filter((t) => t > 0);
  const max = nonZeroTotals.length > 0 ? Math.max(...nonZeroTotals) : 0;
  const min = nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals) : 0;

  const expandedData = expandedDay ? dayMap.get(expandedDay) : undefined;

  return (
    <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, paddingTop: 16, paddingBottom: 16 }}>
      <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', paddingHorizontal: 14, marginBottom: 12 }}>
        // DAILY.SPEND
      </Text>

      <View style={{ flexDirection: 'row', paddingHorizontal: 14, marginBottom: 6 }}>
        {weekdayLabels.map((label, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' }}>{label}</Text>
          </View>
        ))}
      </View>

      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: GAP }}
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
      >
        {gridWidth > 0 && cells.map((day, i) => {
          if (day === null) {
            return <View key={`pad-${i}`} style={{ width: cellSize, height: cellSize }} />;
          }
          const dayData = dayMap.get(day);
          const total = dayData?.total ?? 0;
          const isZero = total === 0;
          const fill = isZero ? '#1a1a1a' : spendIntensityToGray(total, min, max);
          const isExpanded = expandedDay === day;
          const dayNumber = parseInt(day.slice(-2), 10);

          return (
            <Pressable key={day} onPress={() => setExpandedDay((d) => (d === day ? null : day))}>
              {({ pressed }) => (
                <View
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: fill,
                    borderRadius: T.radius,
                    borderWidth: 1,
                    borderColor: isExpanded ? T.text.secondary : (pressed ? T.text.muted : 'transparent'),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isZero ? (
                    <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>{'✕'}</Text>
                  ) : (
                    <Text style={{ color: T.text.secondary, fontSize: 10, fontFamily: 'SpaceMono-Regular' }}>{dayNumber}</Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {expandedDay && (
        <View style={{ marginTop: 12, paddingTop: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: T.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: T.text.secondary, fontSize: 11, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>
              {formatDate(expandedDay).toUpperCase()}
            </Text>
            <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular' }}>
              {formatCurrency(expandedData?.total ?? 0, currency)}
            </Text>
          </View>

          {!expandedData || expandedData.categories.length === 0 ? (
            <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular', letterSpacing: 2 }}>
              NO SPEND
            </Text>
          ) : (
            expandedData.categories.map((c) => {
              const dayTotal = expandedData.total;
              const pct = dayTotal > 0 ? Math.round((c.total / dayTotal) * 100) : 0;
              const gray = getCategoryColor(c.categoryColor, colorTheme, c.categoryColorOverride);
              return (
                <View key={c.categoryId} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 6, height: 6, backgroundColor: gray }} />
                      <Text style={{ color: T.text.primary, fontSize: 12 }}>{c.categoryName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' }}>{pct}%</Text>
                      <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>
                        {formatCurrency(c.total, currency)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ height: 1, backgroundColor: T.border }}>
                    <View style={{ height: 1, backgroundColor: gray, width: `${pct}%` }} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}
