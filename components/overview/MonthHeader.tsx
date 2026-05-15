import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { formatMonthLabel } from "../../lib/format";

interface Props {
  monthISO: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthHeader({ monthISO, onPrev, onNext }: Props) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Pressable
        onPress={onPrev}
        className="w-9 h-9 items-center justify-center rounded-full bg-card"
      >
        <ChevronLeft size={20} color="#A0A0C0" />
      </Pressable>
      <Text className="text-text-primary text-base font-semibold">
        {formatMonthLabel(monthISO)}
      </Text>
      <Pressable
        onPress={onNext}
        className="w-9 h-9 items-center justify-center rounded-full bg-card"
      >
        <ChevronRight size={20} color="#A0A0C0" />
      </Pressable>
    </View>
  );
}
