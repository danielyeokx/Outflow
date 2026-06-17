import { useState, useEffect } from "react";
import {
  View, Text, Pressable, ScrollView, TextInput,
  Alert, ActivityIndicator, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Trash2, Plus, Save, Check } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { useCategories, useKeywordsForCategory, useStaticKeywordsEnabled, useColorTheme } from "../../lib/queries";
import { useAddKeyword, useDeleteKeyword, useRenameCategory, useDeleteCategory, useUpdateCategoryColor } from "../../lib/mutations";
import { getStaticKeywordsForCategory } from "../../lib/categorize";
import { T, getCategoryColor, CATEGORY_SWATCHES } from "../../lib/theme";
import DotGrid from "../../components/DotGrid";

type IconName = keyof typeof Icons;

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cats = [] } = useCategories();
  const { data: userKeywords = [], isLoading } = useKeywordsForCategory(id);
  const { data: staticEnabled = true } = useStaticKeywordsEnabled();
  const { mutate: addKeyword, isPending: adding } = useAddKeyword();
  const { mutate: deleteKeyword } = useDeleteKeyword();
  const [newKw, setNewKw] = useState("");
  const [renameText, setRenameText] = useState("");
  const [hiddenStaticKws, setHiddenStaticKws] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate: renameCategory, isPending: renaming } = useRenameCategory();
  const { mutate: deleteCategory, isPending: deleting } = useDeleteCategory();
  const { mutate: updateCategoryColor, isPending: updatingColor } = useUpdateCategoryColor();
  const { data: colorTheme = "neutral" } = useColorTheme();

  const category = cats.find((c) => c.id === id);

  useEffect(() => {
    if (category) setRenameText(category.name);
  }, [category?.name]);

  if (!category) return null;

  const gray = getCategoryColor(category.color, colorTheme, category.colorOverride);
  const staticKws = staticEnabled ? getStaticKeywordsForCategory(id) : [];
  const IconComponent = (Icons[category.icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;

  function handleRename() {
    const name = renameText.trim();
    if (!name || name === category!.name) return;
    renameCategory(
      { id, name },
      { onError: () => Alert.alert("Error", "Could not rename category.") }
    );
  }

  function handleDeleteConfirm() {
    deleteCategory(id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.back();
      },
      onError: (e) => {
        setShowDeleteModal(false);
        if (e.message === "CATEGORY_IN_USE") {
          Alert.alert("Cannot Delete", "This category has existing expenses or recurring entries. Remove them first.");
        } else {
          Alert.alert("Error", "Could not delete category.");
        }
      },
    });
  }

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

  function handleDeleteKeyword(keyword: string, isStatic: boolean) {
    if (isStatic) {
      setHiddenStaticKws((prev) => new Set(prev).add(keyword));
    } else {
      deleteKeyword({ keyword, categoryId: id });
    }
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>

        {/* Rename */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
          // RENAME.CATEGORY
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          <TextInput
            style={{
              flex: 1,
              height: 44,
              backgroundColor: T.elevated,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.radius,
              color: T.text.primary,
              fontSize: 14,
              fontFamily: 'SpaceMono-Regular',
              paddingHorizontal: 14,
            }}
            placeholder={category.name}
            placeholderTextColor={T.text.primary}
            value={renameText}
            onChangeText={setRenameText}
            onSubmitEditing={handleRename}
            returnKeyType="done"
            autoCapitalize="none"
          />
          <Pressable
            onPress={handleRename}
            disabled={renaming || !renameText.trim() || renameText.trim() === category.name}
            style={{
              width: 44,
              borderRadius: T.radius,
              borderWidth: 1,
              borderColor: (renameText.trim() && renameText.trim() !== category.name) ? T.text.secondary : T.border,
              backgroundColor: T.surface,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: renaming ? 0.5 : 1,
            }}
          >
            {renaming
              ? <ActivityIndicator size="small" color={T.text.secondary} />
              : <Save size={16} color={T.text.secondary} />
            }
          </Pressable>
        </View>

        {/* Category color — editable only in MULTI-COLOUR theme */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>
            // CATEGORY.COLOR
          </Text>
          {colorTheme === 'multi' && category.colorOverride && (
            <Pressable onPress={() => updateCategoryColor({ id, color: null })} disabled={updatingColor} hitSlop={8}>
              <Text style={{ color: T.text.secondary, fontSize: 10, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>RESET</Text>
            </Pressable>
          )}
        </View>
        {colorTheme === 'multi' ? (
          <>
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, marginBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CATEGORY_SWATCHES.map((swatch) => {
                const active = category.colorOverride?.toLowerCase() === swatch.toLowerCase();
                return (
                  <Pressable
                    key={swatch}
                    onPress={() => updateCategoryColor({ id, color: active ? null : swatch })}
                    disabled={updatingColor}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: T.radius,
                      backgroundColor: swatch,
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? T.text.primary : T.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active && <Check size={14} color="#000000" />}
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ color: T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular', lineHeight: 16, marginBottom: 28 }}>
              Tap a swatch again or RESET to use the default color.
            </Text>
          </>
        ) : (
          <Text style={{ color: T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular', lineHeight: 16, marginBottom: 28 }}>
            Custom colors are only editable in the MULTI-COLOUR theme. Switch theme in Settings to customize.
          </Text>
        )}

        {/* Add keyword input */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
          // ADD.KEYWORD
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          <TextInput
            style={{
              flex: 1,
              height: 44,
              backgroundColor: T.elevated,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.radius,
              color: T.text.primary,
              fontSize: 14,
              fontFamily: 'SpaceMono-Regular',
              paddingHorizontal: 14,
            }}
            placeholder="TYPE KEYWORD..."
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

        {/* Keywords — unified list */}
        <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
          {`// KEYWORDS`}
        </Text>
        {isLoading ? (
          <ActivityIndicator color={T.text.muted} style={{ marginBottom: 24 }} />
        ) : (() => {
          const visibleStatic = staticKws.filter((kw) => !hiddenStaticKws.has(kw));
          const allKws: { keyword: string; isStatic: boolean }[] = [
            ...userKeywords.map((k) => ({ keyword: k.keyword, isStatic: false })),
            ...visibleStatic.map((kw) => ({ keyword: kw, isStatic: true })),
          ];
          return allKws.length === 0 ? (
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, marginBottom: 24 }}>
              <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>no keywords yet</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, marginBottom: 24 }}>
              {allKws.map((item, i) => (
                <View
                  key={item.keyword}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: T.border,
                  }}
                >
                  <Text style={{ flex: 1, color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular' }}>{item.keyword}</Text>
                  <Pressable onPress={() => handleDeleteKeyword(item.keyword, item.isStatic)} hitSlop={8}>
                    <Trash2 size={14} color={T.text.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })()}

        {/* Delete category button */}
        <Pressable onPress={() => setShowDeleteModal(true)} disabled={deleting}>
          {({ pressed }) => (
            <View style={{
              height: 44,
              borderWidth: 1,
              borderColor: T.text.secondary,
              borderRadius: T.radius,
              backgroundColor: pressed ? '#252525' : T.elevated,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: deleting ? 0.5 : 1,
            }}>
              <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 2 }}>
                DELETE CATEGORY
              </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onPress={() => setShowDeleteModal(false)}
        >
          <Pressable onPress={() => {}} style={{ width: '100%' }}>
            <View style={{
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.radius,
              padding: 20,
            }}>
              <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
                // CONFIRM.DELETE
              </Text>
              <Text style={{ color: T.text.primary, fontSize: 15, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 }}>
                {category.name.toUpperCase()}
              </Text>
              <Text style={{ color: T.text.secondary, fontSize: 12, fontFamily: 'SpaceMono-Regular', lineHeight: 18, marginBottom: 24 }}>
                This category will be permanently removed. This action cannot be undone.
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => setShowDeleteModal(false)} style={{ flex: 1 }}>
                  {({ pressed }) => (
                    <View style={{
                      height: 44,
                      borderWidth: 1,
                      borderColor: T.border,
                      borderRadius: T.radius,
                      backgroundColor: pressed ? '#252525' : T.elevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: T.text.secondary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>CANCEL</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable onPress={handleDeleteConfirm} disabled={deleting} style={{ flex: 1 }}>
                  {({ pressed }) => (
                    <View style={{
                      height: 44,
                      borderWidth: 1,
                      borderColor: T.text.secondary,
                      borderRadius: T.radius,
                      backgroundColor: pressed ? '#252525' : T.elevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: deleting ? 0.5 : 1,
                    }}>
                      {deleting
                        ? <ActivityIndicator size="small" color={T.text.secondary} />
                        : <Text style={{ color: T.text.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', letterSpacing: 2 }}>DELETE</Text>
                      }
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
