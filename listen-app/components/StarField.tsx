import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
}

interface StarFieldProps {
  count?: number;
}

/**
 * Deep-space background. Small twinkling dots absolutely positioned across
 * the full viewport. Uses Reanimated for 60fps opacity pulses without native
 * bridge round-trips.
 */
export const StarField: React.FC<StarFieldProps> = ({ count = 80 }) => {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      delay: Math.random() * 4000,
    }));
  }, [count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <TwinklingStar key={s.id} star={s} />
      ))}
    </View>
  );
};

const TwinklingStar: React.FC<{ star: Star }> = ({ star }) => {
  const opacity = useSharedValue(0.2);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1500 + star.delay }),
      -1,
      true,
    );
  }, [opacity, star.delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        animatedStyle,
        {
          top: `${star.top}%`,
          left: `${star.left}%`,
          width: star.size,
          height: star.size,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: Colors.textPrimary,
    borderRadius: 999,
  },
});
