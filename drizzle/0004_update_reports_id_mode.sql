-- This migration aligns the database schema with our ORM's expectation
-- that report IDs should be handled as strings to avoid precision issues

-- We don't need to change the column type in the database, since BIGINT already
-- stores the values correctly. The change is in how the ORM interprets the data.

-- Add this comment so administrators understand how to handle report IDs
COMMENT ON COLUMN "reports"."id" IS 'Store as BIGINT but handle as string in application code to avoid JavaScript number precision issues';