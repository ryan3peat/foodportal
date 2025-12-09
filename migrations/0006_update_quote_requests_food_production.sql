-- Create product category enum for food production
DO $$ BEGIN
 CREATE TYPE "product_category" AS ENUM('dairy_raw', 'dairy_processed', 'finished_goods', 'ingredients', 'packaging', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add new columns for food production to quote_requests table
ALTER TABLE "quote_requests" 
  ADD COLUMN IF NOT EXISTS "product_category" "product_category",
  ADD COLUMN IF NOT EXISTS "product_type" varchar(255),
  ADD COLUMN IF NOT EXISTS "ingredients" text,
  ADD COLUMN IF NOT EXISTS "allergen_information" text,
  ADD COLUMN IF NOT EXISTS "nutritional_requirements" jsonb,
  ADD COLUMN IF NOT EXISTS "packaging_requirements" text,
  ADD COLUMN IF NOT EXISTS "shelf_life" text,
  ADD COLUMN IF NOT EXISTS "storage_conditions" text,
  ADD COLUMN IF NOT EXISTS "certifications_required" jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "food_safety_standards" jsonb DEFAULT '[]'::jsonb;

-- Rename material_name to product_name (keep material_name for backward compatibility during transition)
ALTER TABLE "quote_requests"
  ADD COLUMN IF NOT EXISTS "product_name" varchar(255);

-- Copy data from material_name to product_name if product_name is null
UPDATE "quote_requests"
SET "product_name" = "material_name"
WHERE "product_name" IS NULL AND "material_name" IS NOT NULL;

-- Drop old metal fabrication columns
ALTER TABLE "quote_requests"
  DROP COLUMN IF EXISTS "material_type",
  DROP COLUMN IF EXISTS "material_grade",
  DROP COLUMN IF EXISTS "thickness",
  DROP COLUMN IF EXISTS "dimensions",
  DROP COLUMN IF EXISTS "finish",
  DROP COLUMN IF EXISTS "tolerance",
  DROP COLUMN IF EXISTS "welding_requirements",
  DROP COLUMN IF EXISTS "surface_treatment";

-- Update document_type enum to include additional food production document types
DO $$ BEGIN
  -- Note: PostgreSQL doesn't support ALTER TYPE ADD VALUE in a transaction block easily
  -- These will need to be added manually or via a separate migration
  -- For now, we'll document the needed additions: 'haccp_cert', 'export_certificate', 'fsanz_compliance'
EXCEPTION
 WHEN OTHERS THEN null;
END $$;

