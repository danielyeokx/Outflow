import { View, Text } from "react-native";
import { T } from "../lib/theme";

interface Props {
  sys: string;        // e.g. "SYS.OVERVIEW"
  title: string;      // e.g. "OUTFLOW"
  right?: React.ReactNode;
}

export default function PageHeader({ sys, title, right }: Props) {
  return (
    <View>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>{sys}</Text>
          <Text style={{ color: T.text.primary, fontSize: 22, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>{title}</Text>
        </View>
        {right}
      </View>
      <View style={{ height: 1, backgroundColor: T.border }} />
    </View>
  );
}
