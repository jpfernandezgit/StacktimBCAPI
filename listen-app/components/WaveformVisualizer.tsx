import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface WaveformVisualizerProps {
  active: boolean;
  width?: number;
  height?: number;
  /** 0..1 amplitude hint driven by the processor. */
  amplitude?: number;
}

/**
 * Cosmic radio-wave pulse at the center of the home screen. A sine-sum curve
 * rendered with SVG; the phase animates continuously when `active` is true.
 *
 * We use SVG rather than Skia so the component keeps working on web and in
 * Expo Go without a custom dev-client. Skia is preferred in production for
 * the particle layer — swap it in from services/skiaWave.tsx when available.
 */
export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  active,
  width = 320,
  height = 120,
  amplitude = 0.5,
}) => {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (active) {
      phase.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 2400 }),
        -1,
        false,
      );
    } else {
      cancelAnimation(phase);
      phase.value = withTiming(0, { duration: 300 });
    }
    return () => cancelAnimation(phase);
  }, [active, phase]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.5 + Math.sin(phase.value) * 0.15 : 0.15,
  }));

  // Static SVG frame with three harmonically stacked sine waves for a rich
  // cosmic feel. The phase is quantised on the JS thread every render.
  const paths = buildWavePaths(width, height, amplitude);

  return (
    <View style={[styles.wrapper, { width, height }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: Colors.glowCyan, borderRadius: height / 2 },
          glowStyle,
        ]}
      />
      <Svg width={width} height={height}>
        <Path
          d={paths.back}
          stroke={Colors.accentCyan}
          strokeOpacity={0.25}
          strokeWidth={2}
          fill="none"
        />
        <Path
          d={paths.mid}
          stroke={Colors.accentCyan}
          strokeOpacity={0.6}
          strokeWidth={2}
          fill="none"
        />
        <Path
          d={paths.front}
          stroke={active ? Colors.accentCyan : Colors.textSecondary}
          strokeWidth={2.5}
          fill="none"
        />
      </Svg>
    </View>
  );
};

function buildWavePaths(w: number, h: number, amp: number) {
  const cy = h / 2;
  const steps = 64;
  const build = (freq: number, phase: number, scale: number): string => {
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * w;
      const t = (i / steps) * Math.PI * 2 * freq + phase;
      const y = cy + Math.sin(t) * (cy - 4) * scale * amp;
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `;
    }
    return d;
  };
  return {
    front: build(2, 0, 0.8),
    mid: build(3, 1.2, 0.55),
    back: build(4, 2.4, 0.35),
  };
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
