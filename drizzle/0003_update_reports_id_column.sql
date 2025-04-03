-- Change reports table id column type from INTEGER to BIGINT to handle large IDs
ALTER TABLE "reports" ALTER COLUMN "id" TYPE BIGINT;