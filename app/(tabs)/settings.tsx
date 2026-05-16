import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, ChevronDown, Download, Trash2 } from "lucide-react-native";
import { useCategories, useDefaultCurrency } from "../../lib/queries";
import { useSetDefaultCurrency, useClearAllData, useClearAllKeywords, useResetCategories, exportExpensesCSV } from "../../lib/mutations";
import { T, toGray } from "../../lib/theme";
import { CURRENCIES } from "../../lib/rates";
import DotGrid from "../../components/DotGrid";
import PageHeader from "../../components/PageHeader";
import * as Icons from "lucide-react-native";

type IconName = keyof typeof Icons;

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', marginBottom: 10 }}>
      {label}
    </Text>
  );
}

function CategoryRow({ id, name, color, icon, isLast }: { id: string; name: string; color: string; icon: string; isLast: boolean }) {
  const IconComponent = (Icons[icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
  const gray = toGray(color);

  return (
    <Pressable
      onPress={() => router.push(`/category/${id}`)}
      style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: T.border }}
    >
      {({ pressed }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent' }}>
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
  const { data: defaultCurrency = "SGD" } = useDefaultCurrency();
  const { mutate: setCurrency } = useSetDefaultCurrency();
  const { mutate: clearAllData, isPending: clearing } = useClearAllData();
  const { mutate: clearKeywords, isPending: clearingKeywords } = useClearAllKeywords();
  const { mutate: resetCategories, isPending: resettingCategories } = useResetCategories();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    exportExpensesCSV()
      .catch((e) => {
        console.error("[outflow] export failed:", e);
        Alert.alert("Export failed", e?.message ?? "Could not export data.");
      })
      .finally(() => setExporting(false));
  }

  function handleClearKeywords() {
    Alert.alert(
      "Clear all keywords?",
      "Removes all keyword→category associations, including built-in ones. Auto-categorisation will stop working until keywords are re-added. Categories and expenses are unaffected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Keywords", style: "destructive",
          onPress: () =>
            Alert.alert("Are you sure?", "This cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              { text: "Yes, clear all", style: "destructive", onPress: () => clearKeywords() },
            ]),
        },
      ]
    );
  }

  function handleResetCategories() {
    Alert.alert(
      "Reset categories?",
      "Restores the 8 default categories (names and icons reset), removes unused custom categories, and clears all learned keywords. Custom categories with existing expenses are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset", style: "destructive",
          onPress: () =>
            Alert.alert("Are you sure?", "This cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              { text: "Yes, reset", style: "destructive", onPress: () => resetCategories() },
            ]),
        },
      ]
    );
  }

  function handleClearAll() {
    Alert.alert(
      "Clear all data?",
      "This permanently deletes all expenses, recurring entries, and learned keywords. Categories are kept. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything", style: "destructive",
          onPress: () =>
            Alert.alert("Are you sure?", "All expense data will be gone forever.", [
              { text: "Cancel", style: "cancel" },
              { text: "Yes, delete it all", style: "destructive", onPress: () => clearAllData() },
            ]),
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      <PageHeader sys="SYS.CONFIG" title="SETTINGS" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 24 }} showsVerticalScrollIndicator={false}>

        {/* Categories */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel label={`// CATEGORIES [${cats.length}]`} />
            <Pressable
              onPress={() => router.push('/category/new')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 11, paddingHorizontal: 16, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, backgroundColor: T.surface }}
            >
              <Text style={{ color: T.text.secondary, fontSize: 10, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>+ NEW</Text>
            </Pressable>
          </View>
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
        </View>

        {/* Preferences */}
        <View>
          <SectionLabel label="// PREFERENCES" />
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
            {/* Currency row */}
            <Pressable onPress={() => setCurrencyOpen((o) => !o)}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent' }}>
                  <Text style={{ color: T.text.secondary, fontSize: 10, fontFamily: 'SpaceMono-Regular', letterSpacing: 2, flex: 1 }}>DEFAULT CURRENCY</Text>
                  <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular', marginRight: 8 }}>{defaultCurrency}</Text>
                  <ChevronDown size={14} color={T.text.muted} />
                </View>
              )}
            </Pressable>
            {currencyOpen && (
              <View style={{ borderTopWidth: 1, borderTopColor: T.border, paddingHorizontal: 14, paddingVertical: 10, gap: 2 }}>
                {CURRENCIES.map((c) => {
                  const active = defaultCurrency === c.code;
                  return (
                    <Pressable
                      key={c.code}
                      onPress={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                    >
                      {({ pressed }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: T.radius, backgroundColor: active ? T.elevated : pressed ? T.elevated : 'transparent' }}>
                          <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular', width: 44 }}>{c.code}</Text>
                          <Text style={{ color: T.text.muted, fontSize: 11, fontFamily: 'SpaceMono-Regular', flex: 1 }}>{c.label}</Text>
                          {active && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.text.secondary }} />}
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Data — export */}
        <View>
          <SectionLabel label="// DATA" />
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
            {/* Export */}
            <Pressable onPress={handleExport} disabled={exporting}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent', opacity: exporting ? 0.5 : 1 }}>
                  {exporting
                    ? <ActivityIndicator size="small" color={T.text.secondary} style={{ marginRight: 12 }} />
                    : <Download size={15} color={T.text.secondary} style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: T.text.primary, fontSize: 13, flex: 1 }}>Export to CSV</Text>
                  <ChevronRight size={14} color={T.text.muted} />
                </View>
              )}
            </Pressable>
          </View>
          {/* Destructive actions — separate card */}
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, marginTop: 12 }}>
            {/* Clear keywords */}
            <Pressable onPress={handleClearKeywords} disabled={clearingKeywords} style={{ borderBottomWidth: 1, borderBottomColor: T.border }}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent', opacity: clearingKeywords ? 0.5 : 1 }}>
                  {clearingKeywords
                    ? <ActivityIndicator size="small" color="#666" style={{ marginRight: 12 }} />
                    : <Trash2 size={15} color="#666" style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: '#666', fontSize: 13, flex: 1 }}>Clear All Keywords</Text>
                </View>
              )}
            </Pressable>
            {/* Reset categories */}
            <Pressable onPress={handleResetCategories} disabled={resettingCategories} style={{ borderBottomWidth: 1, borderBottomColor: T.border }}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent', opacity: resettingCategories ? 0.5 : 1 }}>
                  {resettingCategories
                    ? <ActivityIndicator size="small" color="#666" style={{ marginRight: 12 }} />
                    : <Trash2 size={15} color="#666" style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: '#666', fontSize: 13, flex: 1 }}>Reset Categories to Defaults</Text>
                </View>
              )}
            </Pressable>
            {/* Clear all */}
            <Pressable onPress={handleClearAll} disabled={clearing}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent', opacity: clearing ? 0.5 : 1 }}>
                  {clearing
                    ? <ActivityIndicator size="small" color="#666" style={{ marginRight: 12 }} />
                    : <Trash2 size={15} color="#666" style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: '#666', fontSize: 13, flex: 1 }}>Clear All Data</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
