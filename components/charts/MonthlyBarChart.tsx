import { View, Text, ScrollView } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { format, parseISO } from "date-fns";

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
    frontColor: "#7C6FFF",
  }));

  return (
    // overflow visible so x-axis labels aren't clipped by borderRadius
    <View style={{ overflow: 'visible' }}>
      <View style={{ backgroundColor: '#22222F', borderRadius: 16, paddingTop: 20, paddingBottom: 16, overflow: 'visible' }}>
        <Text style={{ color: '#A0A0C0', fontSize: 13, fontWeight: '600', paddingHorizontal: 16, marginBottom: 12 }}>
          Daily Spending
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={barData}
            height={CHART_HEIGHT}
            barWidth={18}
            spacing={8}
            roundedTop
            hideRules
            xAxisColor="#2E2E3E"
            yAxisColor="transparent"
            yAxisTextStyle={{ color: "#6B6B8A", fontSize: 10 }}
            xAxisLabelTextStyle={{ color: "#6B6B8A", fontSize: 10 }}
            noOfSections={4}
            maxValue={Math.ceil(maxVal / 100)}
            isAnimated
            animationDuration={600}
            barBorderRadius={4}
            backgroundColor="#22222F"
            width={Math.max(data.length * 26 + 40, 300)}
            xAxisThickness={1}
            yAxisThickness={0}
          />
        </ScrollView>
      </View>
    </View>
  );
}
