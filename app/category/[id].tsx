import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, TextInput,
  Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, X, Plus } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { useCategories, useKeywordsForCategory } from "../../lib/queries";
import { useAddKeyword, useDeleteKeyword } from "../../lib/mutations";
import { getStaticKeywordsForCategory } from "../../lib/categorize";
import { T, toGray } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";

type IconName = keyof typeof Icons;

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cats = [] } = useCategories();
  const { data: userKeywords = [], isLoading } = useKeywordsForCategory(id);
  const { mutate: addKeyword, isPending: adding } = useAddKeyword();
  const { mutate: deleteKeyword } = useDeleteKeyword();

  const [newKw, setNewKw] = useState("");

  const category = cats.find((c) => c.id === id);
  if (!category) return null;

  const gray = toGray(category.color);
  const staticKws = getStaticKeywordsForCategory(id);
  const IconComponent = (Icons[category.icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;

  function handleAdd() {
    const kw = newKw.trim();
    if (!kw) return;
    addKeyword(
      { keyword: kw, categoryId: id },
      {
        onSuccess: () => setNewKw(""),
        onError: () => Alert.alert("Error", "Could not add keyword."),
      }
    );
  }

  function handleDelete(keyword: string) {
    Alert.alert("Remove keyword?", `"${keyword}" will no longer auto-suggest this category.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteKeyword({ keyword, categoryId: id }) },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={16} color={T.text.secondary} />
        </Pressable>
        <View style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <IconComponent size={15} color={gray} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>CATEGORY</Text>
          <Text style={{ color: T.text.primary, fontSize: 18, fontWeight: '700', letterSpacing: 1 }}>{category.name.toUpperCase()}</Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 20, marginBottom: 20 }} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Add keyword input */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
          // ADD.KEYWORD
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: T.elevated,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.radius,
              color: T.text.primary,
              fontSize: 14,
              fontFamily: 'SpaceMono-Regular',
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
            placeholder="type keyword..."
            placeholderTextColor={T.text.muted}
            value={newKw}
            onChangeText={setNewKw}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoCapitalize="none"
          />
          <Pressable
            onPress={handleAdd}
            disabled={adding || !newKw.trim()}
            style={{
              width: 44,
              borderRadius: T.radius,
              borderWidth: 1,
              borderColor: newKw.trim() ? T.text.secondary : T.border,
              backgroundColor: T.surface,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: adding ? 0.5 : 1,
            }}
          >
            {adding ? <ActivityIndicator size="small" color={T.text.secondary} /> : <Plus size={16} color={T.text.secondary} />}
          </Pressable>
        </View>

        {/* User-added keywords */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
          // USER.KEYWORDS {userKeywords.length > 0 ? `[${userKeywords.length}]` : ''}
        </Text>
        {isLoading ? (
          <ActivityIndicator color={T.text.muted} style={{ marginBottom: 20 }} />
        ) : userKeywords.length === 0 ? (
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, marginBottom: 24 }}>
            <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>no user keywords yet</Text>
          </View>
        ) : (
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, marginBottom: 24 }}>
            {userKeywords.map((kw, i) => (
              <View
                key={kw.keyword}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: T.border,
                }}
              >
                <Text style={{ flex: 1, color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular' }}>{kw.keyword}</Text>
                <Pressable onPress={() => handleDelete(kw.keyword)} hitSlop={8}>
                  <X size={14} color={T.text.muted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Static / built-in keywords */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
          // BUILT-IN.KEYWORDS [{staticKws.length}]
        </Text>
        <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
          {staticKws.length === 0 ? (
            <View style={{ padding: 14 }}>
              <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>none</Text>
            </View>
          ) : (
            staticKws.map((kw, i) => (
              <View
                key={kw}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: T.border,
                }}
              >
                <Text style={{ flex: 1, color: T.text.secondary, fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>{kw}</Text>
                <Text style={{ color: T.text.muted, fontSize: 9, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>READ-ONLY</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
