import { Tabs, router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LayoutDashboard, List, Plus, RefreshCw, Settings } from "lucide-react-native";
import { T } from "../../lib/theme";

function CenterAddButton() {
  return (
    <Pressable
      onPress={() => router.push("/add")}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {({ pressed }) => (
        <View style={{
          width: 44,
          height: 44,
          borderRadius: T.radius,
          borderWidth: 1,
          borderColor: pressed ? T.text.secondary : T.border,
          backgroundColor: pressed ? T.elevated : T.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Plus size={20} color={T.text.primary} />
        </View>
      )}
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 52 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#444444',
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600', letterSpacing: 1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'OVERVIEW',
          tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'EXPENSES',
          tabBarIcon: ({ color }) => <List size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-tab"
        options={{
          tabBarButton: () => <CenterAddButton />,
        }}
      />
      <Tabs.Screen
        name="recurring"
        options={{
          title: 'RECURRING',
          tabBarIcon: ({ color }) => <RefreshCw size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
