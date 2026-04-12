/**
 * High-level signal processing service. Wraps the pure FFT/anomaly utilities
 * and produces a `ProcessedPacket` ready for upload.
 */

import { AnomalyResult, scorePacket } from '../utils/anomalyScore';

export interface RawPacket {
  id: string;
  skySector: string;
  ra: number;
  decCoord: number;
  samples: number[];
}

export interface ProcessedPacket {
  packetId: string;
  skySector: string;
  result: AnomalyResult;
  completedAt: string;
}

/**
 * Process a single raw packet and return the result payload. Pure — easy to
 * unit test; the background task layer is responsible for I/O.
 */
export function processPacket(packet: RawPacket): ProcessedPacket {
  const result = scorePacket(packet.samples);
  return {
    packetId: packet.id,
    skySector: packet.skySector,
    result,
    completedAt: new Date().toISOString(),
  };
}
