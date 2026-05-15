import { useState } from "react";
import {
  View, Text, TextInput, Pressable,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { useCategories } from "../../lib/queries";
import { useAddCategory } from "../../lib/mutations";
import { T, toGray } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";

type IconName = keyof typeof Icons;

const ICON_OPTIONS: IconName[] = [
  "UtensilsCrossed", "Car", "ShoppingBag", "FileText", "Gamepad2",
  "Heart", "Plane", "MoreHorizontal", "Coffee", "Music",
  "Book", "Home", "Briefcase", "Gift", "Camera",
  "Dumbbell", "Baby", "Scissors", "Shirt", "Wifi",
  "Fuel", "Pill", "GraduationCap", "Dog", "Wrench",
];

const PREVIEW_COLOR = '#AAAAAA';

export default function NewCategoryScreen() {
  const { data: cats = [] } = useCategories();
  const { mutate: addCategory, isPending } = useAddCategory();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("MoreHorizontal");

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) { Alert.alert("Name required"); return; }
    addCategory(
      { name: trimmed, icon, existingCount: cats.length },
      {
        onSuccess: () => router.back(),
        onError: () => Alert.alert("Error", "Could not create category."),
      }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.CONFIG</Text>
          <Text style={{ color: T.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>NEW CATEGORY</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} color={T.text.secondary} />
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 20, marginBottom: 20 }} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 8 }}>CATEGORY.NAME</Text>
        <TextInput
          style={{
            backgroundColor: T.elevated,
            borderWidth: 1,
            borderColor: T.border,
            borderRadius: T.radius,
            color: T.text.primary,
            fontSize: 16,
            paddingHorizontal: 14,
            paddingVertical: 13,
            marginBottom: 24,
          }}
          placeholder="e.g. Subscriptions"
          placeholderTextColor={T.text.muted}
          value={name}
          onChangeText={setName}
          returnKeyType="done"
        />

        {/* Icon picker */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>SELECT.ICON</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {ICON_OPTIONS.map((iconName) => {
            const IC = Icons[iconName] as React.ComponentType<{ size: number; color: string }>;
            const selected = icon === iconName;
            return (
              <Pressable
                key={iconName}
                onPress={() => setIcon(iconName)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: T.radius,
                  borderWidth: 1,
                  borderColor: selected ? T.text.secondary : T.border,
                  backgroundColor: selected ? T.elevated : T.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IC size={18} color={selected ? T.text.primary : T.text.muted} />
              </Pressable>
            );
          })}
        </View>

        {/* Preview */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>PREVIEW</Text>
        <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <View style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
            {(() => {
              const IC = Icons[icon] as React.ComponentType<{ size: number; color: string }>;
              return <IC size={16} color={PREVIEW_COLOR} />;
            })()}
          </View>
          <Text style={{ color: name.trim() ? T.text.primary : T.text.muted, fontSize: 14 }}>
            {name.trim() || "Category name"}
          </Text>
          <View style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: 4, backgroundColor: PREVIEW_COLOR }} />
        </View>

        {/* Create */}
        <Pressable
          onPress={handleCreate}
          disabled={isPending || !name.trim()}
          style={{
            backgroundColor: T.elevated,
            borderWidth: 1,
            borderColor: name.trim() ? T.text.secondary : T.border,
            borderRadius: T.radius,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: isPending || !name.trim() ? 0.5 : 1,
            marginBottom: 40,
          }}
        >
          {isPending
            ? <ActivityIndicator color={T.text.primary} />
            : <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 3 }}>[ CREATE ]</Text>
          }
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
