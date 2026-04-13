import { magnitudeSpectrum } from '../fft';
import {
  detectPeaks,
  kurtosis,
  scorePacket,
  spectralFlatness,
  topPeakZScore,
} from '../anomalyScore';

/** Deterministic Gaussian-ish noise via Box-Muller with a seeded PRNG. */
function seededNoise(n: number, seed = 42): number[] {
  let state = seed;
  const rnd = () => {
    state = (state * 1664525 + 1013904223) | 0;
    return ((state >>> 0) % 1_000_000) / 1_000_000;
  };
  const out: number[] = [];
  for (let i = 0; i < n; i += 2) {
    const u1 = Math.max(rnd(), 1e-9);
    const u2 = rnd();
    const r = Math.sqrt(-2 * Math.log(u1));
    out.push(r * Math.cos(2 * Math.PI * u2));
    out.push(r * Math.sin(2 * Math.PI * u2));
  }
  return out.slice(0, n);
}

describe('anomalyScore', () => {
  test('kurtosis of gaussian noise is near zero', () => {
    const k = kurtosis(seededNoise(2048));
    expect(Math.abs(k)).toBeLessThan(1.0);
  });

  test('spectralFlatness of white noise is close to 1', () => {
    const spectrum = new Array(256).fill(0).map(() => 1 + Math.random() * 0.1);
    const flatness = spectralFlatness(spectrum);
    expect(flatness).toBeGreaterThan(0.9);
  });

  test('detectPeaks finds injected peak above threshold', () => {
    const spectrum = new Array(256).fill(1);
    spectrum[100] = 50;
    const peaks = detectPeaks(spectrum, 3);
    expect(peaks[0]).toBe(100);
  });

  test('pure noise scores low', () => {
    const result = scorePacket(seededNoise(1024, 7));
    expect(result.score).toBeLessThan(45);
  });

  test('noise + strong narrowband tone scores high', () => {
    const n = 1024;
    const noise = seededNoise(n, 3);
    const signal = noise.map(
      (v, i) => v + 10 * Math.sin((2 * Math.PI * 37 * i) / n),
    );
    const result = scorePacket(signal);
    expect(result.score).toBeGreaterThan(55);
    expect(result.peakFrequencies.length).toBeGreaterThan(0);
  });

  test('topPeakZScore is large for a pure tone, small for white noise', () => {
    const n = 1024;
    const tone = Array.from({ length: n }, (_, i) =>
      Math.sin((2 * Math.PI * 41 * i) / n),
    );
    const toneSpectrum = magnitudeSpectrum(tone);
    expect(topPeakZScore(toneSpectrum)).toBeGreaterThan(10);

    const noiseSpectrum = magnitudeSpectrum(seededNoise(n, 11));
    expect(topPeakZScore(noiseSpectrum)).toBeLessThan(10);
  });
});
