/**
 * Plan facts, in one place, with no database import — safe for the public
 * marketing pages as well as the app.
 *
 * TRIAL_DAYS is deliberately env-driven: the marketing plan calls for a
 * sequential test of a longer trial (T-13). Set TRIAL_DAYS=14 in the
 * environment to run the long-trial cohort; every new registration records
 * the value it was given, so /admin/measurement can compare cohorts without
 * anyone having to remember when the switch was flipped.
 */

export const PLAN_AMOUNT_CENTS = 150_000; // R1,500.00
export const PLAN_CURRENCY = "ZAR";
export const PLAN_PRICE_LABEL = "R1,500";

const DEFAULT_TRIAL_DAYS = 3;

function readTrialDays(): number {
  const raw = Number(process.env.TRIAL_DAYS);
  if (!Number.isFinite(raw) || raw < 1 || raw > 90) return DEFAULT_TRIAL_DAYS;
  return Math.floor(raw);
}

export const TRIAL_DAYS = readTrialDays();

/** "3-day" / "14-day" — for use in front of a noun. */
export const TRIAL_LABEL = `${TRIAL_DAYS}-day`;

/** "3 days" / "14 days". */
export const TRIAL_DAYS_LABEL = `${TRIAL_DAYS} ${TRIAL_DAYS === 1 ? "day" : "days"}`;
