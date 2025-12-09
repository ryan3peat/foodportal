-- Update supplier_applications table for food production
-- Drop old welding and surface treatment columns
ALTER TABLE "supplier_applications"
  DROP COLUMN IF EXISTS "welding_capabilities",
  DROP COLUMN IF EXISTS "surface_treatment_options";

-- Add new food safety and traceability columns
ALTER TABLE "supplier_applications"
  ADD COLUMN IF NOT EXISTS "food_safety_systems" jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "traceability_systems" jsonb DEFAULT '[]'::jsonb;

