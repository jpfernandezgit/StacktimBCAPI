/**
 * Default waveform export. Points at the SVG-based WaveformVisualizer so
 * the home screen boots in Expo Go, on web, and in a fresh dev-client
 * without any native setup.
 *
 * The richer Skia version lives in `../WaveformSkia.tsx`. To enable it,
 * install @shopify/react-native-skia in a native dev-client, then swap
 * this file's export to the Skia component (or add a platform-specific
 * `index.native.ts`). Keeping it behind a manual opt-in avoids bundling
 * Skia on platforms that don't support it out of the box.
 */
export { WaveformVisualizer as Waveform } from '../WaveformVisualizer';

export interface WaveformProps {
  active: boolean;
  width?: number;
  height?: number;
  amplitude?: number;
}
