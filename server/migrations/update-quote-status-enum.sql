-- Migration: Update preliminary_approval_status enum to new quote workflow statuses
-- Date: 2025-11-12
-- Description: Changes the preliminary_approval_status enum from ['pending', 'approved', 'rejected']
--              to ['initial_submitted', 'pending_documentation', 'final_submitted', 'rejected']

-- Step 1: Add new enum type with updated values
CREATE TYPE preliminary_approval_status_new AS ENUM (
  'initial_submitted',
  'pending_documentation',
  'final_submitted',
  'rejected'
);

-- Step 2: Drop the default value temporarily
ALTER TABLE supplier_quotes
  ALTER COLUMN preliminary_approval_status DROP DEFAULT;

-- Step 3: Alter column to temporarily use text type and update values
ALTER TABLE supplier_quotes
  ALTER COLUMN preliminary_approval_status TYPE text;

-- Step 3: Update existing data to map old values to new values
-- pending → initial_submitted (supplier submitted, awaiting admin review)
-- approved → pending_documentation (admin requested docs)
-- rejected → rejected (stays the same)
UPDATE supplier_quotes
SET preliminary_approval_status =
  CASE
    WHEN preliminary_approval_status = 'pending' THEN 'initial_submitted'
    WHEN preliminary_approval_status = 'approved' THEN 'pending_documentation'
    WHEN preliminary_approval_status = 'rejected' THEN 'rejected'
    ELSE preliminary_approval_status
  END;

-- Step 4: Alter column to use new enum type
ALTER TABLE supplier_quotes
  ALTER COLUMN preliminary_approval_status TYPE preliminary_approval_status_new
  USING preliminary_approval_status::preliminary_approval_status_new;

-- Step 5: Drop old enum type
DROP TYPE IF EXISTS preliminary_approval_status;

-- Step 6: Rename new enum type to original name
ALTER TYPE preliminary_approval_status_new RENAME TO preliminary_approval_status;

-- Step 7: Update default value
ALTER TABLE supplier_quotes
  ALTER COLUMN preliminary_approval_status SET DEFAULT 'initial_submitted';

-- Verification query (uncomment to test)
-- SELECT preliminary_approval_status, COUNT(*) as count
-- FROM supplier_quotes
-- GROUP BY preliminary_approval_status;
