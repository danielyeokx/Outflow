import { View, useWindowDimensions } from "react-native";
import Svg, { Defs, Pattern, Rect, Circle } from "react-native-svg";

export default function DotGrid() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <Pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="0.8" cy="0.8" r="0.8" fill="#FFFFFF" opacity="0.06" />
          </Pattern>
        </Defs>
        <Rect width={width} height={height} fill="url(#dotgrid)" />
      </Svg>
    </View>
  );
}
