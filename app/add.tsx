import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import ExpenseForm from "../components/expense/ExpenseForm";

export default function AddExpenseScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: '#0F0F14' }}>
      <View className="px-5 pt-5 pb-2 flex-row items-center justify-between">
        <Text className="text-text-primary text-xl font-bold">Add Expense</Text>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-card"
        >
          <X size={20} color="#A0A0C0" />
        </Pressable>
      </View>
      <ScrollView
        className="flex-1 px-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ExpenseForm onSuccess={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
