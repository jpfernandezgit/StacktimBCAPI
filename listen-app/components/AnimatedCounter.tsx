import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { FontSizes, Typography } from '../constants/typography';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
}

/**
 * Eases the displayed value towards `value` over `duration` ms so large
 * counters (like "12 million phones") feel alive without re-rendering every
 * frame of React. Uses an integer quantisation step for a terminal feel.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1200,
  style,
}) => {
  const [displayed, setDisplayed] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = displayed;
    startRef.current = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - (startRef.current ?? Date.now());
      const t = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(
        fromRef.current + (value - fromRef.current) * eased,
      );
      setDisplayed(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <Text
      style={[styles.text, style]}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      {format(displayed)}
    </Text>
  );
};

function format(n: number): string {
  return n.toLocaleString('en-US');
}

const styles = StyleSheet.create({
  text: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
});
