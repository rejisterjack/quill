/** Seat / query limits mirrored from schema defaults + lib/billing.applyProPlan. */
export const PLAN_LIMITS = {
  free: {
    seats: 3,
    monthlyQueries: 100_000,
  },
  pro: {
    seats: 10,
    monthlyQueries: 100_000,
  },
} as const;
