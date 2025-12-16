// Consistent spacing scale for the entire app
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

// Common padding/margin values
export const layout = {
  screenPadding: spacing.xl, // 16px
  cardPadding: spacing.lg, // 16px
  sectionSpacing: spacing.xxl, // 24px
  elementSpacing: spacing.md, // 12px
} as const;

