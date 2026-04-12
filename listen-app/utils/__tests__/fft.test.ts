import {
  fftInPlace,
  isPowerOfTwo,
  magnitudeSpectrum,
  zeroPadToPowerOfTwo,
} from '../fft';

describe('fft utilities', () => {
  test('isPowerOfTwo', () => {
    expect(isPowerOfTwo(1)).toBe(true);
    expect(isPowerOfTwo(2)).toBe(true);
    expect(isPowerOfTwo(1024)).toBe(true);
    expect(isPowerOfTwo(3)).toBe(false);
    expect(isPowerOfTwo(0)).toBe(false);
    expect(isPowerOfTwo(-4)).toBe(false);
  });

  test('zeroPadToPowerOfTwo pads up', () => {
    const out = zeroPadToPowerOfTwo([1, 2, 3]);
    expect(out.length).toBe(4);
    expect(out).toEqual([1, 2, 3, 0]);
  });

  test('fft of constant signal concentrates energy at DC', () => {
    const n = 16;
    const spectrum = magnitudeSpectrum(new Array(n).fill(1));
    // DC bin dominates.
    expect(spectrum[0]).toBeGreaterThan(0);
    for (let i = 1; i < spectrum.length; i++) {
      expect(spectrum[i]).toBeLessThan(1e-9);
    }
  });

  test('fft of pure tone has a single dominant bin', () => {
    const n = 128;
    const targetBin = 12;
    const signal = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      signal[i] = Math.sin((2 * Math.PI * targetBin * i) / n);
    }
    const spectrum = magnitudeSpectrum(signal);
    let maxIdx = 0;
    for (let i = 1; i < spectrum.length; i++) {
      if (spectrum[i] > spectrum[maxIdx]) maxIdx = i;
    }
    expect(maxIdx).toBe(targetBin);
  });

  test('fftInPlace rejects non power-of-two lengths', () => {
    const re = [1, 2, 3];
    const im = [0, 0, 0];
    expect(() => fftInPlace(re, im)).toThrow(/power of two/);
  });
});
