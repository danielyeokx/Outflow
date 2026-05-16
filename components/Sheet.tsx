import { View, Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "../lib/theme";

interface Props {
  children: React.ReactNode;
}

export default function Sheet({ children }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = height * 0.8;

  return (
    <View style={{ flex: 1, justifyContent: "flex-end" }}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }}
        onPress={() => router.back()}
      />
      <View
        style={{
          height: sheetHeight,
          backgroundColor: T.bg,
          borderTopWidth: 1,
          borderTopColor: T.border,
          paddingBottom: insets.bottom,
        }}
      >
        {children}
      </View>
    </View>
  );
}
