import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Plus, Trash2, RefreshCw } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { useRecurring } from "../../lib/queries";
import { useDeleteRecurring } from "../../lib/mutations";
import { formatCurrency } from "../../lib/format";
import { frequencyLabel, getNextDueDate } from "../../lib/recurring";
import { T, toGray } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";

type IconName = keyof typeof Icons;

export default function RecurringScreen() {
  const { data: items = [] } = useRecurring();
  const { mutate: deleteRecurring } = useDeleteRecurring();

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete recurring?", `"${name}" will stop auto-logging.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteRecurring(id) },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.SCHEDULE</Text>
          <Text style={{ color: T.text.primary, fontSize: 22, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>RECURRING</Text>
        </View>
        <Pressable
          onPress={() => router.push("/recurring/new")}
          style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={18} color={T.text.primary} />
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 20, marginBottom: 4 }} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <RefreshCw size={28} color={T.text.muted} style={{ marginBottom: 16 }} />
            <Text style={{ color: T.text.muted, fontSize: 12, letterSpacing: 2, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }}>
              {'[ NO RECURRING ENTRIES ]\n\nTap + to add one.'}
            </Text>
          </View>
        ) : (
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
            {items.map((item, index) => {
              const IC = (Icons[item.categoryIcon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
              const gray = toGray(item.categoryColor);
              const nextDue = getNextDueDate(item);
              const freq = frequencyLabel(item);

              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: T.border,
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <IC size={15} color={gray} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text.primary, fontSize: 13 }} numberOfLines={1}>{item.itemName}</Text>
                    <Text style={{ color: T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 2 }}>{freq}</Text>
                    {nextDue && (
                      <Text style={{ color: T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 1 }}>
                        {`NEXT · ${nextDue}`}
                      </Text>
                    )}
                  </View>
                  <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular', marginRight: 12 }}>
                    {formatCurrency(item.amountCents)}
                  </Text>
                  <Pressable onPress={() => confirmDelete(item.id, item.itemName)} hitSlop={8}>
                    <Trash2 size={14} color={T.text.muted} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
