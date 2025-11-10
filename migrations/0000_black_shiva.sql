CREATE TYPE "public"."category" AS ENUM('natural', 'synthetic', 'natural_identical');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('coa', 'pif', 'specification', 'sds', 'halal', 'kosher', 'natural_status', 'process_flow', 'gfsi_cert', 'organic');--> statement-breakpoint
CREATE TYPE "public"."form" AS ENUM('liquid', 'powder', 'paste');--> statement-breakpoint
CREATE TYPE "public"."magic_link_type" AS ENUM('login', 'password_setup');--> statement-breakpoint
CREATE TYPE "public"."preliminary_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."quote_request_status" AS ENUM('draft', 'active', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('submitted', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'supplier', 'procurement');--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"type" "magic_link_type" DEFAULT 'login' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "magic_links_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_number" varchar(50) NOT NULL,
	"material_name" varchar(255) NOT NULL,
	"cas_number" varchar(50),
	"fema_number" varchar(50),
	"material_form" "form",
	"material_grade" varchar(100),
	"material_origin" varchar(255),
	"packaging_requirements" text,
	"material_notes" text,
	"quantity_needed" numeric(10, 2) NOT NULL,
	"unit_of_measure" varchar(50) NOT NULL,
	"specifications" jsonb,
	"additional_specifications" text,
	"submit_by_date" timestamp NOT NULL,
	"status" "quote_request_status" DEFAULT 'draft' NOT NULL,
	"find_new_suppliers" boolean DEFAULT false NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quote_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "request_suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"access_token" varchar(64),
	"token_expires_at" timestamp,
	"email_sent_at" timestamp,
	"email_opened_at" timestamp,
	"response_submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "request_suppliers_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_quote_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_url" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" numeric NOT NULL,
	"mime_type" varchar(100),
	"uploaded_by" varchar NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'AUD' NOT NULL,
	"moq" text,
	"lead_time" text,
	"validity_date" timestamp,
	"payment_terms" text,
	"additional_notes" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"pack_size" text,
	"shipping_terms" text,
	"freight_cost" numeric(10, 2),
	"shelf_life" text,
	"storage_requirements" text,
	"dangerous_goods_handling" text,
	"preliminary_approval_status" "preliminary_approval_status" DEFAULT 'pending' NOT NULL,
	"preliminary_approved_at" timestamp,
	"preliminary_approved_by" varchar,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"status" "quote_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_name" varchar(255) NOT NULL,
	"contact_person" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email2" varchar(255),
	"phone" varchar(50),
	"location" text,
	"moq" text,
	"lead_times" text,
	"payment_terms" text,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" "role" DEFAULT 'supplier' NOT NULL,
	"company_name" varchar,
	"password_hash" varchar(255),
	"password_set_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_suppliers" ADD CONSTRAINT "request_suppliers_request_id_quote_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_suppliers" ADD CONSTRAINT "request_suppliers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_supplier_quote_id_supplier_quotes_id_fk" FOREIGN KEY ("supplier_quote_id") REFERENCES "public"."supplier_quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_request_id_quote_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_quotes" ADD CONSTRAINT "supplier_quotes_preliminary_approved_by_users_id_fk" FOREIGN KEY ("preliminary_approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_magic_links_token_hash" ON "magic_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_magic_links_email" ON "magic_links" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_magic_links_expires_at" ON "magic_links" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_supplier_documents_quote_id" ON "supplier_documents" USING btree ("supplier_quote_id");