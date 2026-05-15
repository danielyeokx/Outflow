import { View, Text, Pressable, FlatList, Modal } from "react-native";
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { Category } from "../../lib/schema";

type IconName = keyof typeof Icons;

interface Props {
  categories: Category[];
  value: string | null;
  onChange: (id: string) => void;
  error?: string;
}

export default function CategoryPicker({ categories, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={`flex-row items-center bg-card rounded-xl px-4 py-3.5 ${
          error ? "border border-red-500" : "border border-transparent"
        }`}
      >
        {selected ? (
          <>
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: selected.color + "30" }}
            >
              {(() => {
                const IC = (Icons[selected.icon as IconName] ??
                  Icons.MoreHorizontal) as React.ComponentType<{
                  size: number;
                  color: string;
                }>;
                return <IC size={16} color={selected.color} />;
              })()}
            </View>
            <Text className="text-text-primary text-base flex-1">{selected.name}</Text>
          </>
        ) : (
          <Text className="text-text-muted text-base flex-1">Select category</Text>
        )}
        <ChevronDown size={18} color="#6B6B8A" />
      </Pressable>
      {error && <Text className="text-red-400 text-xs mt-1 ml-1">{error}</Text>}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setOpen(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl pb-10">
            <View className="w-10 h-1 bg-border rounded-full self-center mt-3 mb-4" />
            <Text className="text-text-primary text-lg font-bold px-5 mb-3">
              Choose Category
            </Text>
            <FlatList
              data={categories}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => {
                const IC = (Icons[item.icon as IconName] ??
                  Icons.MoreHorizontal) as React.ComponentType<{
                  size: number;
                  color: string;
                }>;
                const isSelected = value === item.id;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                    className="flex-row items-center px-5 py-3.5 active:opacity-70"
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: item.color + "30" }}
                    >
                      <IC size={18} color={item.color} />
                    </View>
                    <Text className="text-text-primary text-base flex-1">{item.name}</Text>
                    {isSelected && <Check size={18} color="#7C6FFF" />}
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
