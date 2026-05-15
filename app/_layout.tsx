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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A' }}>
        <Text style={{ color: '#888888', fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>DB ERR: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator color="#888888" />
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
            <Stack.Screen name="add" options={{ presentation: "modal" }} />
            <Stack.Screen name="category/[id]" />
            <Stack.Screen name="category/new" options={{ presentation: "modal" }} />
          </Stack>
        </MigrationGate>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
