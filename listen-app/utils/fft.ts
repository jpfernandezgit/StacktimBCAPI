/**
 * Radix-2 Cooley-Tukey iterative FFT in pure TypeScript.
 *
 * Designed for small-to-medium real signals (N <= 4096) running on-device
 * inside the background task. We avoid native dependencies so the same code
 * runs on iOS, Android and Web without extra build steps.
 *
 * The implementation is intentionally allocation-light: it mutates two flat
 * arrays of length N rather than creating N Complex objects.
 */

/** Returns true if n is a power of two and > 0. */
export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Pad a real signal with zeros up to the next power of two.
 */
export function zeroPadToPowerOfTwo(signal: readonly number[]): number[] {
  if (isPowerOfTwo(signal.length)) return signal.slice();
  let target = 1;
  while (target < signal.length) target <<= 1;
  const out = new Array<number>(target).fill(0);
  for (let i = 0; i < signal.length; i++) out[i] = signal[i];
  return out;
}

/**
 * In-place bit reversal permutation of two parallel arrays.
 */
function bitReverse(re: number[], im: number[]): void {
  const n = re.length;
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }
}

/**
 * Perform an in-place radix-2 FFT on the parallel real/imaginary arrays.
 * Length MUST be a power of two. Use {@link zeroPadToPowerOfTwo} first.
 */
export function fftInPlace(re: number[], im: number[]): void {
  const n = re.length;
  if (!isPowerOfTwo(n)) {
    throw new Error(`FFT length must be a power of two, received ${n}`);
  }

  bitReverse(re, im);

  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const tableStep = (-2 * Math.PI) / size;
    for (let i = 0; i < n; i += size) {
      for (let k = 0; k < half; k++) {
        const angle = tableStep * k;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const evenRe = re[i + k];
        const evenIm = im[i + k];
        const oddRe = re[i + k + half];
        const oddIm = im[i + k + half];
        const tRe = oddRe * cos - oddIm * sin;
        const tIm = oddRe * sin + oddIm * cos;
        re[i + k] = evenRe + tRe;
        im[i + k] = evenIm + tIm;
        re[i + k + half] = evenRe - tRe;
        im[i + k + half] = evenIm - tIm;
      }
    }
  }
}

/**
 * Compute the magnitude spectrum of a real-valued signal.
 * Returns an array of length N/2 (no Nyquist duplication).
 */
export function magnitudeSpectrum(signal: readonly number[]): number[] {
  const re = zeroPadToPowerOfTwo(signal);
  const im = new Array<number>(re.length).fill(0);
  fftInPlace(re, im);
  const half = re.length >> 1;
  const out = new Array<number>(half);
  for (let i = 0; i < half; i++) {
    out[i] = Math.hypot(re[i], im[i]);
  }
  return out;
}
