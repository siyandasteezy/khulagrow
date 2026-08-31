-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trialDays" INTEGER,
ADD COLUMN     "signupSource" TEXT,
ADD COLUMN     "signupMedium" TEXT,
ADD COLUMN     "signupCampaign" TEXT,
ADD COLUMN     "signupReferrer" TEXT,
ADD COLUMN     "signupLandingPath" TEXT;

-- Backfill the trial length for accounts created before the trial-length test
-- began. Everyone up to this point was given the 3-day trial.
UPDATE "User" SET "trialDays" = 3 WHERE "trialDays" IS NULL AND "trialEndsAt" IS NOT NULL;
