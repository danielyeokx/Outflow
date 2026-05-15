import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategories } from "../../lib/queries";
import { T, toGray } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";
import * as Icons from "lucide-react-native";

type IconName = keyof typeof Icons;

function CategoryRow({ name, color, icon }: { name: string; color: string; icon: string }) {
  const IconComponent = (Icons[icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
  const gray = toGray(color);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border }}>
      <View style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <IconComponent size={16} color={gray} />
      </View>
      <Text style={{ color: T.text.primary, fontSize: 14, flex: 1 }}>{name}</Text>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: gray }} />
    </View>
  );
}

export default function SettingsScreen() {
  const { data: cats = [] } = useCategories();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.CONFIG</Text>
        <Text style={{ color: T.text.primary, fontSize: 22, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>SETTINGS</Text>
      </View>

      <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 20, marginBottom: 20 }} />

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 12 }}>
          // CATEGORIES
        </Text>
        <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, paddingHorizontal: 14 }}>
          <FlatList
            data={cats}
            keyExtractor={(c) => c.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <CategoryRow name={item.name} color={item.color} icon={item.icon} />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
