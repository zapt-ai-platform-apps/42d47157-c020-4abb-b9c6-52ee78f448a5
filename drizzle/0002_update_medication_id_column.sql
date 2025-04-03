-- Change medication_id column type from INTEGER to BIGINT to handle large IDs
ALTER TABLE "side_effects" ALTER COLUMN "medication_id" TYPE BIGINT;