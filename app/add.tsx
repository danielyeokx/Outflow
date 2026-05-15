import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { T } from "../lib/theme";
import DotGrid from "../components/DotGrid";
import ExpenseForm from "../components/expense/ExpenseForm";

export default function AddExpenseScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <DotGrid />

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular' }}>SYS.INPUT</Text>
          <Text style={{ color: T.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>NEW ENTRY</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} color={T.text.secondary} />
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 20, marginBottom: 4 }} />

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ExpenseForm onSuccess={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
