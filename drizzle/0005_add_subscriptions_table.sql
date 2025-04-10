-- Create subscriptions table
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "current_period_start" TIMESTAMP,
  "current_period_end" TIMESTAMP,
  "cancel_at_period_end" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create user_reports_count table to track how many reports each user has created
CREATE TABLE IF NOT EXISTS "user_reports_count" (
  "user_id" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_id" ON "subscriptions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_reports_count_user_id" ON "user_reports_count" ("user_id");