import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useDatabaseMigration, seedDefaultCategories } from "../lib/db";
import { View, Text, ActivityIndicator } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30 } },
});

function MigrationGate({ children }: { children: React.ReactNode }) {
  const { success, error } = useDatabaseMigration();

  useEffect(() => {
    if (success) seedDefaultCategories();
  }, [success]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-red-400 text-base">DB error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7C6FFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <MigrationGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add"
              options={{ presentation: "modal", headerShown: false }}
            />
          </Stack>
        </MigrationGate>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
