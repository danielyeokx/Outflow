import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategories } from "../../lib/queries";
import * as Icons from "lucide-react-native";

type IconName = keyof typeof Icons;

function CategoryRow({ name, color, icon }: { name: string; color: string; icon: string }) {
  const IconComponent = (Icons[icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{
    size: number;
    color: string;
  }>;

  return (
    <View className="flex-row items-center py-3 border-b border-border">
      <View
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: color + "30" }}
      >
        <IconComponent size={18} color={color} />
      </View>
      <Text className="text-text-primary text-base flex-1">{name}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { data: cats = [] } = useCategories();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background" style={{ flex: 1, backgroundColor: '#0F0F14' }}>
      <View className="px-5 pt-6 pb-4">
        <Text className="text-text-primary text-2xl font-bold">Settings</Text>
      </View>

      <View className="px-5">
        <Text className="text-text-secondary text-sm font-semibold uppercase tracking-widest mb-2">
          Categories
        </Text>
        <FlatList
          data={cats}
          keyExtractor={(c) => c.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <CategoryRow name={item.name} color={item.color} icon={item.icon} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
