/**
 * LISTEN design system — colors.
 * Philosophy: NASA Mission Control meets Interstellar.
 * Deep space blacks, bioluminescent cyan accents, warning golds and reds.
 */

export const Colors = {
  // Backgrounds
  bgPrimary: '#0A0E17',    // deep space, near-black blue
  bgSecondary: '#111827',  // elevated surfaces
  bgCard: '#1A1F2E',       // anomaly cards

  // Accents
  accentCyan: '#06D6A0',   // active status, waves, live dots
  accentGold: '#FFD166',   // anomalies, medium alerts
  accentRed: '#EF476F',    // critical alerts
  accentGreen: '#06D6A0',  // reserved — the green nobody has seen... yet

  // Text
  textPrimary: '#F8F9FA',  // soft white
  textSecondary: '#6B7280',
  textDim: '#374151',

  // Utility
  transparent: 'transparent',
  border: '#1F2937',
  glowCyan: 'rgba(6, 214, 160, 0.35)',
  glowGold: 'rgba(255, 209, 102, 0.35)',
  glowRed: 'rgba(239, 71, 111, 0.35)',
} as const;

export type ColorToken = keyof typeof Colors;
