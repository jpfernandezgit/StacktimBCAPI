/**
 * Default waveform export. Points at the SVG-based WaveformVisualizer so
 * the home screen boots in Expo Go, on web, and in a fresh dev-client
 * without any native setup. A richer Skia version can be dropped in later
 * behind a platform-specific `index.native.ts` once we ship a custom
 * dev-client with @shopify/react-native-skia configured.
 */
export { WaveformVisualizer as Waveform } from '../WaveformVisualizer';

export interface WaveformProps {
  active: boolean;
  width?: number;
  height?: number;
  amplitude?: number;
}
