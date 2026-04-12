/**
 * Anomaly scoring for candidate radio-telescope packets.
 *
 * A "packet" is a short real-valued time series. The scorer returns a number
 * in [0, 100] where:
 *   - pure Gaussian noise scores near zero
 *   - weak narrowband or chirp injections score 40-70
 *   - strong, clearly non-random injections score 85+
 *
 * The score is a weighted combination of three independent heuristics:
 *   1. Spectral peak sharpness (narrowband detection)
 *   2. Spectral flatness (Wiener entropy) — low flatness = structured signal
 *   3. Kurtosis / tail-weight of the time-domain samples (non-Gaussian test)
 */

import { Config } from '../constants/config';
import { magnitudeSpectrum } from './fft';

export interface AnomalyResult {
  /** Final score, 0..100 (higher = more suspicious). */
  score: number;
  /** Dominant frequency bin indices with the largest magnitudes. */
  peakFrequencies: number[];
  /** Spectral flatness in [0, 1]. Near 1 = white noise, near 0 = tonal. */
  spectralFlatness: number;
  /** Excess kurtosis of the raw samples (0 = gaussian). */
  kurtosis: number;
  /** Processing time in milliseconds. */
  processingTimeMs: number;
}

/** Mean and population standard deviation. */
function meanStd(values: readonly number[]): { mean: number; std: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, std: 0 };
  let sum = 0;
  for (let i = 0; i < n; i++) sum += values[i];
  const mean = sum / n;
  let sq = 0;
  for (let i = 0; i < n; i++) {
    const d = values[i] - mean;
    sq += d * d;
  }
  return { mean, std: Math.sqrt(sq / n) };
}

/** Excess kurtosis (Gaussian -> 0). */
export function kurtosis(values: readonly number[]): number {
  const { mean, std } = meanStd(values);
  if (std === 0) return 0;
  const n = values.length;
  let m4 = 0;
  for (let i = 0; i < n; i++) {
    const z = (values[i] - mean) / std;
    m4 += z * z * z * z;
  }
  return m4 / n - 3;
}

/**
 * Spectral flatness = geometric mean / arithmetic mean of the magnitude
 * spectrum. Computed in log space to avoid underflow.
 */
export function spectralFlatness(spectrum: readonly number[]): number {
  const n = spectrum.length;
  if (n === 0) return 1;
  let logSum = 0;
  let arithSum = 0;
  let valid = 0;
  for (let i = 1; i < n; i++) {            // skip DC bin
    const v = spectrum[i];
    if (v > 1e-12) {
      logSum += Math.log(v);
      arithSum += v;
      valid++;
    }
  }
  if (valid === 0) return 1;
  const geo = Math.exp(logSum / valid);
  const arith = arithSum / valid;
  if (arith === 0) return 1;
  return Math.min(1, geo / arith);
}

/**
 * Return indices of spectrum bins whose magnitude is more than `sigmas`
 * standard deviations above the mean. Indices are returned sorted by
 * magnitude, descending, capped at `maxPeaks`.
 */
export function detectPeaks(
  spectrum: readonly number[],
  sigmas: number,
  maxPeaks = 5,
): number[] {
  const { mean, std } = meanStd(spectrum);
  if (std === 0) return [];
  const threshold = mean + sigmas * std;
  const candidates: { index: number; magnitude: number }[] = [];
  for (let i = 1; i < spectrum.length - 1; i++) {
    const v = spectrum[i];
    if (v > threshold && v >= spectrum[i - 1] && v >= spectrum[i + 1]) {
      candidates.push({ index: i, magnitude: v });
    }
  }
  candidates.sort((a, b) => b.magnitude - a.magnitude);
  return candidates.slice(0, maxPeaks).map((c) => c.index);
}

/**
 * Score a real-valued packet. Pure function, no side effects.
 */
export function scorePacket(samples: readonly number[]): AnomalyResult {
  const start = Date.now();
  const spectrum = magnitudeSpectrum(samples);
  const flatness = spectralFlatness(spectrum);
  const peaks = detectPeaks(spectrum, Config.peakStdDevThreshold);
  const k = kurtosis(samples);

  // Component scores, each clamped to [0, 1].
  // 1. Narrowband evidence: more peaks -> higher component, saturating at 5.
  const peakComponent = Math.min(1, peaks.length / 5);

  // 2. Tonality: (1 - flatness). White noise -> ~0. Pure tone -> ~1.
  const tonalComponent = Math.max(0, Math.min(1, 1 - flatness));

  // 3. Non-Gaussianity: |kurtosis| / 6 saturating. Occasional chirps create
  //    heavy tails. Negative kurtosis (sub-Gaussian) is also noteworthy.
  const kurtComponent = Math.min(1, Math.abs(k) / 6);

  // Weighted mix — peaks dominate because narrowband emission is the classic
  // SETI signature.
  const mix =
    0.55 * peakComponent +
    0.30 * tonalComponent +
    0.15 * kurtComponent;

  const score = Math.round(Math.min(100, Math.max(0, mix * 100)));

  return {
    score,
    peakFrequencies: peaks,
    spectralFlatness: flatness,
    kurtosis: k,
    processingTimeMs: Date.now() - start,
  };
}
