/**
 * Skia-powered waveform. Preferred when `@shopify/react-native-skia` is
 * available. Renders three stacked sine harmonics on a shared canvas with
 * a Perlin-like noise drift, plus an orbit of particles around the
 * bounding circle when `active` is true.
 *
 * The SVG variant (`WaveformVisualizer.tsx`) is kept as a graceful fallback
 * for Expo Go / Web, where Skia may not be installed yet. Consumers should
 * import this module through `components/waveform/index.ts`, which picks
 * the right implementation at runtime.
 */
import {
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  useClockValue,
  useComputedValue,
} from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';

interface WaveformSkiaProps {
  active: boolean;
  width?: number;
  height?: number;
  amplitude?: number;
}

const PARTICLE_COUNT = 14;

export const WaveformSkia: React.FC<WaveformSkiaProps> = ({
  active,
  width = 320,
  height = 140,
  amplitude = 0.6,
}) => {
  const clock = useClockValue();

  const particlesSeed = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        angle0: (i / PARTICLE_COUNT) * Math.PI * 2,
        speed: 0.35 + (i % 3) * 0.1,
        radius: 0.32 + (i % 4) * 0.05,
      })),
    [],
  );

  // Front / mid / back wave paths — recomputed on every clock tick.
  const path = useComputedValue(() => {
    const t = clock.current / 1000;
    const build = (freq: number, phase: number, scale: number) => {
      const p = Skia.Path.Make();
      const steps = 80;
      const cy = height / 2;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const arg = (i / steps) * Math.PI * 2 * freq + phase + t * (active ? 2 : 0.3);
        const y = cy + Math.sin(arg) * (cy - 6) * scale * amplitude;
        if (i === 0) p.moveTo(x, y);
        else p.lineTo(x, y);
      }
      return p;
    };
    return {
      front: build(2, 0, 0.85),
      mid: build(3, 1.2, 0.55),
      back: build(4, 2.4, 0.35),
    };
  }, [clock, width, height, amplitude, active]);

  // Particle orbit positions — derived from the same clock so everything is
  // perfectly synchronised without extra re-renders.
  const particles = useComputedValue(() => {
    const t = clock.current / 1000;
    return particlesSeed.map((p) => {
      const angle = p.angle0 + t * p.speed * (active ? 1 : 0);
      return {
        x: width / 2 + Math.cos(angle) * width * p.radius,
        y: height / 2 + Math.sin(angle) * height * p.radius,
        r: 1.5 + Math.sin(t * 2 + p.angle0) * 0.8,
      };
    });
  }, [clock, particlesSeed, width, height, active]);

  return (
    <View style={[styles.wrapper, { width, height }]}>
      <Canvas style={{ width, height }}>
        <Group>
          <Path
            path={useComputedValue(() => path.current.back, [path])}
            color={Colors.accentCyan}
            style="stroke"
            strokeWidth={1.5}
            opacity={0.25}
          />
          <Path
            path={useComputedValue(() => path.current.mid, [path])}
            color={Colors.accentCyan}
            style="stroke"
            strokeWidth={2}
            opacity={0.55}
          />
          <Path
            path={useComputedValue(() => path.current.front, [path])}
            color={active ? Colors.accentCyan : Colors.textSecondary}
            style="stroke"
            strokeWidth={2.5}
          />
          {active &&
            particlesSeed.map((_, i) => (
              <Circle
                key={i}
                cx={useComputedValue(() => particles.current[i].x, [particles])}
                cy={useComputedValue(() => particles.current[i].y, [particles])}
                r={useComputedValue(() => particles.current[i].r, [particles])}
                color={Colors.accentCyan}
                opacity={0.7}
              />
            ))}
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
