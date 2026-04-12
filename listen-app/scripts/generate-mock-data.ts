/**
 * Mock radio-telescope packet generator.
 *
 * Generates {COUNT} JSON packets (default 10_000) that look like 1024-sample
 * real-valued time series. Three classes of packet:
 *
 *   95% pure Gaussian noise
 *    4% Gaussian noise + weak narrowband tone (score target 40-70)
 *    1% Gaussian noise + strong narrowband OR chirp (score target 85+)
 *
 * Each packet is written to /tmp/listen-mock/packet_XXXXX.json.
 *
 * Usage (local dev):
 *   npx ts-node scripts/generate-mock-data.ts
 *
 * Upload to Supabase Storage with:
 *   supabase storage cp /tmp/listen-mock listen-packets --recursive
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const COUNT = parseInt(process.env.COUNT ?? '10000', 10);
const N = 1024;
const OUT_DIR = process.env.OUT_DIR ?? '/tmp/listen-mock';

type PacketClass = 'noise' | 'weak' | 'strong';

interface Packet {
  id: string;
  class: PacketClass;
  skySector: string;
  ra: number;
  dec: number;
  samples: number[];
  hasInjectedSignal: boolean;
}

/** Deterministic-ish xorshift for reproducibility if seed is set. */
function makeRng(seed: number): () => number {
  let s = seed | 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/** Box-Muller Gaussian. */
function gaussian(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function generatePacket(idx: number): Packet {
  const rng = makeRng(idx + 1);
  const roll = rng();
  const klass: PacketClass = roll < 0.95 ? 'noise' : roll < 0.99 ? 'weak' : 'strong';

  const samples = new Array<number>(N);
  for (let i = 0; i < N; i++) samples[i] = gaussian(rng);

  if (klass !== 'noise') {
    const freq = Math.floor(rng() * 200) + 20;       // bin index
    const amp = klass === 'weak' ? 1.2 : 6.0;
    const pulsed = klass === 'strong' && rng() < 0.5;
    for (let i = 0; i < N; i++) {
      const envelope = pulsed
        ? Math.max(0, Math.sin((2 * Math.PI * i) / 128))
        : 1;
      samples[i] += amp * envelope * Math.sin((2 * Math.PI * freq * i) / N);
    }
  }

  const sectorN = Math.floor(rng() * 99) + 1;
  const sectorL = String.fromCharCode(65 + Math.floor(rng() * 26));

  return {
    id: `pkt_${idx.toString().padStart(6, '0')}`,
    class: klass,
    skySector: `${sectorN}-${sectorL}`,
    ra: rng() * 24,
    dec: rng() * 180 - 90,
    samples,
    hasInjectedSignal: klass !== 'noise',
  };
}

function main(): void {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let noise = 0;
  let weak = 0;
  let strong = 0;
  for (let i = 0; i < COUNT; i++) {
    const p = generatePacket(i);
    if (p.class === 'noise') noise++;
    else if (p.class === 'weak') weak++;
    else strong++;
    fs.writeFileSync(
      path.join(OUT_DIR, `${p.id}.json`),
      JSON.stringify(p),
    );
    if ((i + 1) % 1000 === 0) {
      process.stdout.write(`  generated ${i + 1}/${COUNT}\n`);
    }
  }
  process.stdout.write(
    `\ndone — ${COUNT} packets in ${OUT_DIR}\n` +
      `  noise : ${noise}\n` +
      `  weak  : ${weak}\n` +
      `  strong: ${strong}\n`,
  );
}

main();
