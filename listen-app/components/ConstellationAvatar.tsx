import React, { useMemo } from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { buildConstellation } from '../utils/constellationGen';

interface ConstellationAvatarProps {
  userId: string;
  size?: number;
}

/**
 * Renders the user's deterministic personal constellation inside a circular
 * frame. Same userId -> same constellation.
 */
export const ConstellationAvatar: React.FC<ConstellationAvatarProps> = ({
  userId,
  size = 120,
}) => {
  const data = useMemo(() => buildConstellation(userId), [userId]);

  return (
    <Svg width={size} height={size} viewBox="0 0 1 1">
      <Circle
        cx={0.5}
        cy={0.5}
        r={0.5}
        fill={Colors.bgSecondary}
      />
      {data.edges.map(([a, b], i) => {
        const sa = data.stars[a];
        const sb = data.stars[b];
        return (
          <Line
            key={`e-${i}`}
            x1={sa.x}
            y1={sa.y}
            x2={sb.x}
            y2={sb.y}
            stroke={Colors.accentCyan}
            strokeOpacity={0.35}
            strokeWidth={0.005}
          />
        );
      })}
      {data.stars.map((s, i) => (
        <Circle
          key={`s-${i}`}
          cx={s.x}
          cy={s.y}
          r={0.012 + s.size * 0.018}
          fill={Colors.accentCyan}
        />
      ))}
    </Svg>
  );
};
