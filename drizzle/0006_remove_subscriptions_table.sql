-- This migration removes the subscriptions table as it's not being used
-- The application manages subscriptions directly via the Stripe API

-- Drop the index first to avoid dependency issues
DROP INDEX IF EXISTS "idx_subscriptions_user_id";

-- Drop the subscriptions table
DROP TABLE IF EXISTS "subscriptions";