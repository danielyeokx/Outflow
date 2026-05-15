import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, Plus } from "lucide-react-native";
import { useCategories } from "../../lib/queries";
import { T, toGray } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";
import * as Icons from "lucide-react-native";

type IconName = keyof typeof Icons;

function CategoryRow({ id, name, color, icon, isLast }: { id: string; name: string; color: string; icon: string; isLast: boolean }) {
  const IconComponent = (Icons[icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
  const gray = toGray(color);

  return (
    <Pressable
      onPress={() => router.push(`/category/${id}`)}
      style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: T.border }}
    >
      {({ pressed }) => (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 13,
          paddingHorizontal: 14,
          backgroundColor: pressed ? T.elevated : 'transparent',
        }}>
          <View style={{ width: 30, height: 30, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <IconComponent size={14} color={gray} />
          </View>
          <Text style={{ color: T.text.primary, fontSize: 13, flex: 1 }}>{name}</Text>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: gray, marginRight: 10 }} />
          <ChevronRight size={14} color={T.text.muted} />
        </View>
      )}
    </Pressable>
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Section header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>
            {`// CATEGORIES [${cats.length}]`}
          </Text>
          <Pressable
            onPress={() => router.push('/category/new')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, backgroundColor: T.surface }}
          >
            <Plus size={11} color={T.text.secondary} />
            <Text style={{ color: T.text.secondary, fontSize: 10, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>NEW</Text>
          </Pressable>
        </View>

        {/* Category list */}
        <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
          {cats.map((item, index) => (
            <CategoryRow
              key={item.id}
              id={item.id}
              name={item.name}
              color={item.color}
              icon={item.icon}
              isLast={index === cats.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
