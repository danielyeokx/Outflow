import { useRef } from "react";
import { View, Pressable, useWindowDimensions, Animated, PanResponder, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "../lib/theme";

const DISMISS_THRESHOLD = 120;
const DISMISS_VELOCITY = 0.5;


interface Props {
  children: React.ReactNode;
}

export default function Sheet({ children }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  const overlayOpacity = translateY.interpolate({
    inputRange: [0, height * 0.8],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, { dy, dx }) => dy > 5 && Math.abs(dy) > Math.abs(dx),
    onPanResponderMove: (_, { dy }) => {
      if (dy > 0) translateY.setValue(dy);
    },
    onPanResponderRelease: (_, { dy, vy }) => {
      if (dy > DISMISS_THRESHOLD || vy > DISMISS_VELOCITY) {
        router.back();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    },
  })).current;

  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen overlay — fades as sheet is dragged */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.65)", opacity: overlayOpacity }]}>
        <Pressable style={{ flex: 1 }} onPress={() => router.back()} />
      </Animated.View>

      {/* Sheet — pinned to bottom, slides independently */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: height * 0.8,
          backgroundColor: T.bg,
          borderTopWidth: 1,
          borderTopColor: T.border,
          paddingBottom: insets.bottom,
          transform: [{ translateY }],
        }}
      >
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={{ alignItems: 'center', paddingVertical: 14 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: T.border }} />
        </View>
        {children}
      </Animated.View>
    </View>
  );
}
