import { View, Text, ScrollView } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { format, parseISO } from "date-fns";
import { T } from "../../lib/theme";

interface DayTotal {
  day: string;
  total: number;
}

interface Props {
  data: DayTotal[];
}

const CHART_HEIGHT = 160;

export default function MonthlyBarChart({ data }: Props) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  const barData = data.map((d) => ({
    value: d.total / 100,
    label: format(parseISO(d.day), "d"),
    frontColor: '#FFFFFF',
    labelTextStyle: { color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' },
  }));

  return (
    <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, paddingTop: 16, paddingBottom: 0 }}>
      <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', paddingHorizontal: 14, marginBottom: 12 }}>
        // DAILY.SPEND
      </Text>
      <View style={{ paddingBottom: 56 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={barData}
            height={CHART_HEIGHT}
            barWidth={14}
            spacing={8}
            hideRules
            xAxisColor={T.border}
            yAxisColor="transparent"
            yAxisTextStyle={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' }}
            xAxisLabelTextStyle={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular' }}
            noOfSections={4}
            maxValue={Math.ceil(maxVal / 100)}
            isAnimated
            animationDuration={500}
            barBorderRadius={0}
            backgroundColor={T.surface}
            width={Math.max(data.length * 22 + 40, 300)}
            xAxisThickness={1}
            yAxisThickness={0}
          />
        </ScrollView>
      </View>
    </View>
  );
}
