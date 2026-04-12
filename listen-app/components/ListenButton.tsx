import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { FontSizes, Typography } from '../constants/typography';

interface ListenButtonProps {
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
  label: string;
}

/**
 * Large pulsing circular CTA at the bottom of the home screen. Two states:
 *   - idle  → thin white ring, slow breath
 *   - active → glowing cyan ring, fast breath, particles orbit (SVG would be
 *     overkill; we get the feel from scaled siblings)
 */
export const ListenButton: React.FC<ListenButtonProps> = ({
  active,
  disabled,
  onPress,
  label,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(active ? 1.12 : 1.05, { duration: active ? 900 : 2400 }),
      -1,
      true,
    );
    glow.value = withTiming(active ? 1 : 0, { duration: 400 });
    return () => cancelAnimation(scale);
  }, [active, scale, glow]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.6 + glow.value * 0.4,
    borderColor: active ? Colors.accentCyan : Colors.textPrimary,
  }));

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 1.15 }],
    opacity: active ? 0.35 : 0,
    borderColor: Colors.accentCyan,
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.ring, outerRingStyle]} />
      <Animated.View style={[styles.ring, ringStyle]} />
      <View
        style={[
          styles.core,
          active && { backgroundColor: Colors.bgSecondary },
          disabled && { opacity: 0.4 },
        ]}
      >
        <Text
          style={[
            styles.label,
            active && { color: Colors.accentCyan },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const SIZE = 200;

const styles = StyleSheet.create({
  pressable: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
  },
  core: {
    width: SIZE * 0.75,
    height: SIZE * 0.75,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  label: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    letterSpacing: 2,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
