import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { useCategories } from "../../lib/queries";
import { useAddCategory } from "../../lib/mutations";
import { T } from "../../lib/theme";
import Sheet from "../../components/Sheet";

type IconName = keyof typeof Icons;

const ICON_OPTIONS: IconName[] = [
  "UtensilsCrossed", "Car", "ShoppingBag", "FileText", "Gamepad2",
  "Heart", "Plane", "MoreHorizontal", "Coffee", "Music",
  "Book", "Home", "Briefcase", "Gift", "Camera",
  "Dumbbell", "Baby", "Scissors", "Shirt", "Wifi",
  "Fuel", "Pill", "GraduationCap", "Dog", "Wrench",
];

const PREVIEW_COLOR = '#AAAAAA';
const L = { color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' as const, marginBottom: 8 };

export default function NewCategoryScreen() {
  const { data: cats = [] } = useCategories();
  const { mutate: addCategory, isPending } = useAddCategory();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("MoreHorizontal");

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) { Alert.alert("Name required"); return; }
    addCategory({ name: trimmed, icon, existingCount: cats.length }, {
      onSuccess: () => router.back(),
      onError: () => Alert.alert("Error", "Could not create category."),
    });
  }

  return (
    <Sheet>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.CONFIG</Text>
          <Text style={{ color: T.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>NEW CATEGORY</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} color={T.text.secondary} />
        </Pressable>
      </View>
      <View style={{ height: 1, backgroundColor: T.border }} />

      {/* Scrollable content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, gap: 0 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        <Text style={L}>CATEGORY.NAME</Text>
        <TextInput
          style={{ backgroundColor: T.elevated, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, color: T.text.primary, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 24 }}
          placeholder="e.g. Subscriptions" placeholderTextColor={T.text.muted}
          value={name} onChangeText={setName} returnKeyType="done"
        />

        <Text style={L}>SELECT.ICON</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {ICON_OPTIONS.map((iconName) => {
            const IC = Icons[iconName] as React.ComponentType<{ size: number; color: string }>;
            const selected = icon === iconName;
            return (
              <Pressable key={iconName} onPress={() => setIcon(iconName)} style={{ width: 44, height: 44, borderRadius: T.radius, borderWidth: 1, borderColor: selected ? T.text.secondary : T.border, backgroundColor: selected ? T.elevated : T.surface, alignItems: 'center', justifyContent: 'center' }}>
                <IC size={18} color={selected ? T.text.primary : T.text.muted} />
              </Pressable>
            );
          })}
        </View>

        <Text style={L}>PREVIEW</Text>
        <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
            {(() => { const IC = Icons[icon] as React.ComponentType<{ size: number; color: string }>; return <IC size={16} color={PREVIEW_COLOR} />; })()}
          </View>
          <Text style={{ color: name.trim() ? T.text.primary : T.text.muted, fontSize: 14, flex: 1 }}>{name.trim() || "Category name"}</Text>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: PREVIEW_COLOR }} />
        </View>
      </ScrollView>

      {/* Sticky create button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: T.border }}>
        <Pressable
          onPress={handleCreate}
          disabled={isPending || !name.trim()}
          style={{ backgroundColor: T.elevated, borderWidth: 1, borderColor: name.trim() ? T.text.secondary : T.border, borderRadius: T.radius, paddingVertical: 16, alignItems: 'center', opacity: isPending || !name.trim() ? 0.5 : 1 }}
        >
          {isPending
            ? <ActivityIndicator color={T.text.primary} />
            : <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 3 }}>[ CREATE ]</Text>
          }
        </Pressable>
      </View>
    </Sheet>
  );
}
