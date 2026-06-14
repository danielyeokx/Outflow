import { useState } from "react";
import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { format, parseISO } from "date-fns";
import { T } from "../../lib/theme";

interface DayTotal {
  day: string;
  total: number;
}

interface Props {
  data: DayTotal[];
  onDayPress?: (day: string) => void;
}

const CHART_HEIGHT = 160;
const YAXIS_W = 35;
const SPACING = 8;

export default function MonthlyBarChart({ data, onDayPress }: Props) {
  const [dataAreaWidth, setDataAreaWidth] = useState(0);
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const n = data.length;

  // initialSpacing=0: x-axis line width = n*(barWidth+spacing).
  // Setting barWidth = (dataAreaWidth - n*spacing) / n keeps it within bounds.
  const barWidth = dataAreaWidth > 0 && n > 0
    ? Math.max(8, Math.floor((dataAreaWidth - n * SPACING) / n))
    : 14;

  const barData = data.map((d) => ({
    value: d.total / 100,
    label: format(parseISO(d.day), "d"),
    frontColor: '#FFFFFF',
    labelTextStyle: { color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' },
  }));

  return (
    <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, paddingTop: 16, paddingBottom: 16 }}>
      <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', paddingHorizontal: 14, marginBottom: 12 }}>
        // DAILY.SPEND
      </Text>
      <View
        style={{ paddingHorizontal: 14 }}
        onLayout={(e) => setDataAreaWidth(e.nativeEvent.layout.width - 14 * 2 - YAXIS_W)}
      >
        {dataAreaWidth > 0 && (
          <BarChart
            key={barData.map((d) => d.value).join('|')}
            data={barData}
            height={CHART_HEIGHT}
            barWidth={barWidth}
            spacing={SPACING}
            initialSpacing={0}
            disableScroll
            hideRules
            yAxisColor="transparent"
            yAxisTextStyle={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' }}
            xAxisLabelTextStyle={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' }}
            noOfSections={4}
            maxValue={Math.ceil(maxVal / 100)}
            isAnimated
            animationDuration={500}
            barBorderRadius={0}
            backgroundColor={T.surface}
            width={dataAreaWidth}
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisLabelWidth={YAXIS_W}
            onPress={(_: unknown, index: number) => onDayPress?.(data[index].day)}
          />
        )}
      </View>
    </View>
  );
}
