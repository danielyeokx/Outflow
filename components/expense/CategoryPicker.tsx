import { View, Text, Pressable, FlatList, Modal } from "react-native";
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { Category } from "../../lib/schema";
import { T, getCategoryColor } from "../../lib/theme";
import { useColorTheme } from "../../lib/queries";

type IconName = keyof typeof Icons;

interface Props {
  categories: Category[];
  value: string | null;
  onChange: (id: string) => void;
  error?: string;
}

export default function CategoryPicker({ categories, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const { data: colorTheme = "neutral" } = useColorTheme();
  const selected = categories.find((c) => c.id === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: T.elevated,
          borderWidth: 1,
          borderColor: error ? '#666666' : T.border,
          borderRadius: T.radius,
          paddingHorizontal: 14,
          paddingVertical: 13,
          minHeight: 44,
        }}
      >
        {selected ? (
          <>
            {(() => {
              const IC = (Icons[selected.icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
              return <IC size={14} color={getCategoryColor(selected.color, colorTheme, selected.colorOverride)} />;
            })()}
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: T.text.primary, fontSize: 14, fontFamily: 'SpaceMono-Regular', flex: 1, marginLeft: 10 }}>{selected.name}</Text>
          </>
        ) : (
          <Text style={{ color: T.text.muted, fontSize: 14, flex: 1, fontFamily: 'SpaceMono-Regular' }}>-- SELECT --</Text>
        )}
        <ChevronDown size={14} color={T.text.muted} />
      </Pressable>
      {error && (
        <Text style={{ color: '#888888', fontSize: 11, fontFamily: 'SpaceMono-Regular', marginTop: 4, marginLeft: 2 }}>{error}</Text>
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setOpen(false)}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.surface, borderTopWidth: 1, borderTopColor: T.border, paddingBottom: 40 }}>
            {/* Handle */}
            <View style={{ width: 32, height: 1, backgroundColor: T.border, alignSelf: 'center', marginTop: 14, marginBottom: 16 }} />
            <Text style={{ color: T.text.muted, fontSize: 10, letterSpacing: 3, fontFamily: 'SpaceMono-Regular', paddingHorizontal: 20, marginBottom: 12 }}>
              // SELECT.CATEGORY
            </Text>
            <FlatList
              data={categories}
              keyExtractor={(c) => c.id}
              renderItem={({ item, index }) => {
                const IC = (Icons[item.icon as IconName] ?? Icons.MoreHorizontal) as React.ComponentType<{ size: number; color: string }>;
                const gray = getCategoryColor(item.color, colorTheme, item.colorOverride);
                const isSelected = value === item.id;
                return (
                  <Pressable
                    onPress={() => { onChange(item.id); setOpen(false); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: T.border,
                      backgroundColor: isSelected ? T.elevated : 'transparent',
                    }}
                  >
                    <View style={{ width: 28, height: 28, borderRadius: T.radius, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <IC size={14} color={gray} />
                    </View>
                    <Text style={{ color: T.text.primary, fontSize: 14, flex: 1 }}>{item.name}</Text>
                    {isSelected && <Check size={14} color={T.text.secondary} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
