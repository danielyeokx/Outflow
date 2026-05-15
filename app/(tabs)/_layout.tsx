import { Tabs, router } from "expo-router";
import { LayoutDashboard, List, Settings } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#444444',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
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
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
