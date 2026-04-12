import React from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface SkyMapProps {
  size: number;
  /** Identifiers of sectors the user has scanned. Each lights up. */
  scannedSectors: string[];
  /** Currently targeted sector (pulses). */
  currentSector?: string | null;
  /** Total grid side (e.g. 20 means a 20x20 grid = 400 sectors). */
  gridSize?: number;
}

/**
 * Personal sky-coverage map: a square grid where each cell is a sky sector.
 * Scanned sectors glow cyan, unscanned are dim, and the current target
 * pulses bright. The mapping from sector id ("47-J") to grid cell is
 * deterministic via a simple hash so the layout is stable.
 */
export const SkyMap: React.FC<SkyMapProps> = ({
  size,
  scannedSectors,
  currentSector,
  gridSize = 20,
}) => {
  const cell = size / gridSize;
  const scannedSet = new Set(scannedSectors);

  const cellFor = (sector: string): { row: number; col: number } => {
    let h = 0;
    for (let i = 0; i < sector.length; i++) {
      h = (h * 31 + sector.charCodeAt(i)) >>> 0;
    }
    return { row: h % gridSize, col: (h >>> 8) % gridSize };
  };

  return (
    <Svg width={size} height={size}>
      <Rect x={0} y={0} width={size} height={size} fill={Colors.bgSecondary} />
      {Array.from({ length: gridSize }).map((_, row) =>
        Array.from({ length: gridSize }).map((_, col) => (
          <Rect
            key={`${row}-${col}`}
            x={col * cell + 1}
            y={row * cell + 1}
            width={cell - 2}
            height={cell - 2}
            fill={Colors.bgPrimary}
          />
        )),
      )}
      {scannedSectors.map((s) => {
        const { row, col } = cellFor(s);
        return (
          <Rect
            key={`lit-${s}`}
            x={col * cell + 1}
            y={row * cell + 1}
            width={cell - 2}
            height={cell - 2}
            fill={Colors.accentCyan}
            fillOpacity={scannedSet.has(s) ? 0.5 : 0.15}
          />
        );
      })}
      {currentSector && (() => {
        const { row, col } = cellFor(currentSector);
        return (
          <Circle
            cx={col * cell + cell / 2}
            cy={row * cell + cell / 2}
            r={cell / 2}
            fill={Colors.accentCyan}
          />
        );
      })()}
    </Svg>
  );
};
