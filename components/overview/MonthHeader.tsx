import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { formatMonthLabel } from "../../lib/format";
import { T } from "../../lib/theme";

interface Props {
  monthISO: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthHeader({ monthISO, onPrev, onNext }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
      <Pressable
        onPress={onPrev}
        style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={16} color={T.text.secondary} />
      </Pressable>
      <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular', letterSpacing: 2 }}>
        {`[ ${formatMonthLabel(monthISO).toUpperCase()} ]`}
      </Text>
      <Pressable
        onPress={onNext}
        style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronRight size={16} color={T.text.secondary} />
      </Pressable>
    </View>
  );
}
