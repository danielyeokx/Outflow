import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, ChevronDown, Download, Upload, Trash2 } from "lucide-react-native";
import { useCategories, useDefaultCurrency, useColorTheme, useWeekStartsOn } from "../../lib/queries";
import { useSetDefaultCurrency, useClearAllData, useClearAllKeywords, useResetCategories, useSetColorTheme, useSetWeekStartsOn, useImportBackup, exportExpensesCSV, exportBackup } from "../../lib/mutations";
import { T, getCategoryColor, COLOR_THEMES } from "../../lib/theme";
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

function CategoryRow({ id, name, color, colorOverride, icon, isLast, colorTheme }: { id: string; name: string; color: string; colorOverride?: string | null; icon: string; isLast: boolean; colorTheme: import("../../lib/theme").ColorTheme }) {
  const IconComponent = (Icons[icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
  const gray = getCategoryColor(color, colorTheme, colorOverride);

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
  const { data: colorTheme = "neutral" } = useColorTheme();
  const { mutate: setColorTheme } = useSetColorTheme();
  const { data: weekStartsOn = 0 } = useWeekStartsOn();
  const { mutate: setWeekStartsOn } = useSetWeekStartsOn();
  const { mutate: importBackup, isPending: importing } = useImportBackup();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);

  function handleExport() {
    setExporting(true);
    exportExpensesCSV()
      .catch((e) => {
        console.error("[outflow] export failed:", e);
        Alert.alert("Export failed", e?.message ?? "Could not export data.");
      })
      .finally(() => setExporting(false));
  }

  function handleExportBackup() {
    setExportingBackup(true);
    exportBackup()
      .catch((e) => {
        console.error("[outflow] backup export failed:", e);
        Alert.alert("Export failed", e?.message ?? "Could not export backup.");
      })
      .finally(() => setExportingBackup(false));
  }

  function handleImportBackup() {
    Alert.alert(
      "Import backup?",
      "This replaces all current categories, expenses, recurring entries, keywords, and settings with the contents of the backup file. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import", style: "destructive",
          onPress: () =>
            importBackup(undefined, {
              onError: (e: any) => {
                console.error("[outflow] backup import failed:", e);
                Alert.alert("Import failed", e?.message ?? "Could not import backup.");
              },
              onSuccess: (imported) => {
                if (imported) Alert.alert("Backup imported", "Your data has been restored.");
              },
            }),
        },
      ]
    );
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
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 11, paddingHorizontal: 14, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, backgroundColor: T.surface }}
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
                colorOverride={item.colorOverride}
                icon={item.icon}
                isLast={index === cats.length - 1}
                colorTheme={colorTheme}
              />
            ))}
          </View>
        </View>

        {/* Color theme */}
        <View>
          <SectionLabel label="// COLOR.THEME" />
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius, padding: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {COLOR_THEMES.map((opt) => {
              const active = colorTheme === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setColorTheme(opt.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: T.radius,
                    borderWidth: 1,
                    borderColor: active ? T.text.secondary : T.border,
                    backgroundColor: active ? T.elevated : 'transparent',
                  }}
                >
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: opt.swatch }} />
                  <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>{opt.label}</Text>
                </Pressable>
              );
            })}
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: T.radius, backgroundColor: active ? T.elevated : pressed ? T.elevated : 'transparent' }}>
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
            {/* First day of week */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: T.border }}>
              <Text style={{ color: T.text.secondary, fontSize: 10, fontFamily: 'SpaceMono-Regular', letterSpacing: 2, flex: 1 }}>FIRST DAY OF WEEK</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {([{ value: 0 as const, label: 'SUN' }, { value: 1 as const, label: 'MON' }]).map((opt) => {
                  const active = weekStartsOn === opt.value;
                  return (
                    <Pressable key={opt.value} onPress={() => setWeekStartsOn(opt.value)}>
                      {({ pressed }) => (
                        <View
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: T.radius,
                            borderWidth: 1,
                            borderColor: active ? T.text.secondary : T.border,
                            backgroundColor: active ? T.elevated : pressed ? T.elevated : 'transparent',
                          }}
                        >
                          <Text style={{ color: active ? T.text.primary : T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular', letterSpacing: 1 }}>{opt.label}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Data — export */}
        <View>
          <SectionLabel label="// DATA" />
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: T.radius }}>
            {/* Export CSV */}
            <Pressable onPress={handleExport} disabled={exporting} style={{ borderBottomWidth: 1, borderBottomColor: T.border }}>
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
            {/* Export backup */}
            <Pressable onPress={handleExportBackup} disabled={exportingBackup} style={{ borderBottomWidth: 1, borderBottomColor: T.border }}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent', opacity: exportingBackup ? 0.5 : 1 }}>
                  {exportingBackup
                    ? <ActivityIndicator size="small" color={T.text.secondary} style={{ marginRight: 12 }} />
                    : <Download size={15} color={T.text.secondary} style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: T.text.primary, fontSize: 13, flex: 1 }}>Export Data & Settings</Text>
                  <ChevronRight size={14} color={T.text.muted} />
                </View>
              )}
            </Pressable>
            {/* Import backup */}
            <Pressable onPress={handleImportBackup} disabled={importing}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? T.elevated : 'transparent', opacity: importing ? 0.5 : 1 }}>
                  {importing
                    ? <ActivityIndicator size="small" color={T.text.secondary} style={{ marginRight: 12 }} />
                    : <Upload size={15} color={T.text.secondary} style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: T.text.primary, fontSize: 13, flex: 1 }}>Import Data & Settings</Text>
                  <ChevronRight size={14} color={T.text.muted} />
                </View>
              )}
            </Pressable>
          </View>
          {/* Destructive actions — separate card, styled red for danger */}
          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: 'rgba(255,69,58,0.35)', borderRadius: T.radius, marginTop: 28 }}>
            {/* Clear keywords */}
            <Pressable onPress={handleClearKeywords} disabled={clearingKeywords} style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,69,58,0.35)' }}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? 'rgba(255,69,58,0.12)' : 'transparent', opacity: clearingKeywords ? 0.5 : 1 }}>
                  {clearingKeywords
                    ? <ActivityIndicator size="small" color="#FF453A" style={{ marginRight: 12 }} />
                    : <Trash2 size={15} color="#FF453A" style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: '#FF453A', fontSize: 13, flex: 1 }}>Clear All Keywords</Text>
                </View>
              )}
            </Pressable>
            {/* Reset categories */}
            <Pressable onPress={handleResetCategories} disabled={resettingCategories} style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,69,58,0.35)' }}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? 'rgba(255,69,58,0.12)' : 'transparent', opacity: resettingCategories ? 0.5 : 1 }}>
                  {resettingCategories
                    ? <ActivityIndicator size="small" color="#FF453A" style={{ marginRight: 12 }} />
                    : <Trash2 size={15} color="#FF453A" style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: '#FF453A', fontSize: 13, flex: 1 }}>Reset Categories to Defaults</Text>
                </View>
              )}
            </Pressable>
            {/* Clear all */}
            <Pressable onPress={handleClearAll} disabled={clearing}>
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: pressed ? 'rgba(255,69,58,0.12)' : 'transparent', opacity: clearing ? 0.5 : 1 }}>
                  {clearing
                    ? <ActivityIndicator size="small" color="#FF453A" style={{ marginRight: 12 }} />
                    : <Trash2 size={15} color="#FF453A" style={{ marginRight: 12 }} />
                  }
                  <Text style={{ color: '#FF453A', fontSize: 13, flex: 1 }}>Clear All Data</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
