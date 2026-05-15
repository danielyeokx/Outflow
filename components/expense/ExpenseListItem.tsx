import { View, Text, Pressable } from "react-native";
import { Trash2 } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { formatCurrency } from "../../lib/format";
import { ExpenseWithCategory } from "../../lib/queries";

type IconName = keyof typeof Icons;

interface Props {
  expense: ExpenseWithCategory;
  onDelete: () => void;
}

export default function ExpenseListItem({ expense, onDelete }: Props) {
  const IconComponent = (
    Icons[(expense.categoryIcon as IconName)] ?? Icons.MoreHorizontal
  ) as React.ComponentType<{ size: number; color: string }>;

  return (
    <View className="flex-row items-center bg-card rounded-xl px-3 py-3 mb-2">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: expense.categoryColor + "30" }}
      >
        <IconComponent size={18} color={expense.categoryColor} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
          {expense.itemName}
        </Text>
        <Text className="text-text-muted text-xs">{expense.categoryName}</Text>
      </View>
      <Text className="text-text-primary text-sm font-semibold mr-3">
        {formatCurrency(expense.amountCents)}
      </Text>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Trash2 size={16} color="#6B6B8A" />
      </Pressable>
    </View>
  );
}
