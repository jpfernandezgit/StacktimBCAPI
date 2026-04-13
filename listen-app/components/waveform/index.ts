/**
 * Runtime-selected waveform. Tries Skia first; if the module is missing
 * (Expo Go, web without the Skia plugin), falls back to the SVG variant.
 *
 * This keeps the home screen importing a single name (`Waveform`) while
 * allowing the heavier, richer Skia layer to light up automatically when
 * a native dev-client has shipped Skia.
 */
import type React from 'react';
import { WaveformVisualizer } from '../WaveformVisualizer';

interface WaveformProps {
  active: boolean;
  width?: number;
  height?: number;
  amplitude?: number;
}

let Impl: React.ComponentType<WaveformProps> = WaveformVisualizer;
try {
  // `require` is synchronous and catchable; ESM `import` is not.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('../WaveformSkia');
  if (mod?.WaveformSkia) {
    Impl = mod.WaveformSkia;
  }
} catch {
  // Skia not installed — stay on the SVG implementation.
}

export const Waveform = Impl;
export type { WaveformProps };
