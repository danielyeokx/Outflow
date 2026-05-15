import { View, Text, Pressable } from "react-native";
import { Trash2 } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { formatCurrency } from "../../lib/format";
import { T, toGray } from "../../lib/theme";
import { ExpenseWithCategory } from "../../lib/queries";

type IconName = keyof typeof Icons;

interface Props {
  expense: ExpenseWithCategory;
  onDelete: () => void;
}

export default function ExpenseListItem({ expense, onDelete }: Props) {
  const IconComponent = (Icons[(expense.categoryIcon as IconName)] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
  const gray = toGray(expense.categoryColor);

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: T.surface,
      borderWidth: 1,
      borderColor: T.border,
      borderRadius: T.radius,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 6,
    }}>
      <View style={{ width: 32, height: 32, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.elevated, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <IconComponent size={15} color={gray} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: T.text.primary, fontSize: 13 }} numberOfLines={1}>{expense.itemName}</Text>
        <Text style={{ color: T.text.muted, fontSize: 10, fontFamily: 'SpaceMono-Regular', marginTop: 2 }}>
          {expense.categoryName.toUpperCase()}
        </Text>
      </View>
      <Text style={{ color: T.text.primary, fontSize: 13, fontFamily: 'SpaceMono-Regular', marginRight: 12 }}>
        {formatCurrency(expense.amountCents)}
      </Text>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Trash2 size={14} color={T.text.muted} />
      </Pressable>
    </View>
  );
}
