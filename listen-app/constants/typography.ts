/**
 * LISTEN design system — typography.
 * Monospaced for terminal / mission-control feel on numbers.
 * DM Sans for body copy.
 */

export const Typography = {
  mono: 'SpaceMono',
  body: 'DMSans',
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  display: 48,
  hero: 72,
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radii = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;
