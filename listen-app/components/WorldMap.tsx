import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface WorldMapProps {
  width: number;
  height: number;
  /** Density of simulated active phones, 0..1. */
  density?: number;
}

/**
 * Highly stylised world map — a starfield-on-a-rectangle rather than a real
 * geographic projection. For MVP this communicates "global network" without
 * shipping a real map tile layer. Swap for react-native-maps later.
 */
export const WorldMap: React.FC<WorldMapProps> = ({
  width,
  height,
  density = 0.8,
}) => {
  const points = useMemo(() => {
    const count = Math.floor(600 * density);
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      a: 0.3 + Math.random() * 0.7,
    }));
  }, [width, height, density]);

  return (
    <View style={styles.wrapper}>
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={Colors.bgPrimary} />
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={Colors.accentCyan}
            fillOpacity={p.a}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
