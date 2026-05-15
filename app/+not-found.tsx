import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-text-primary text-xl font-bold mb-4">
          Screen not found
        </Text>
        <Link href="/">
          <Text className="text-primary text-base">Go home</Text>
        </Link>
      </View>
    </>
  );
}
