CREATE TYPE "public"."notification_type" AS ENUM('documentation_complete');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"related_quote_id" uuid,
	"related_request_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "supplier_quotes" ALTER COLUMN "preliminary_approval_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "supplier_quotes" ALTER COLUMN "preliminary_approval_status" SET DEFAULT 'initial_submitted'::text;--> statement-breakpoint
DROP TYPE "public"."preliminary_approval_status";--> statement-breakpoint
CREATE TYPE "public"."preliminary_approval_status" AS ENUM('initial_submitted', 'pending_documentation', 'final_submitted', 'rejected');--> statement-breakpoint
ALTER TABLE "supplier_quotes" ALTER COLUMN "preliminary_approval_status" SET DEFAULT 'initial_submitted'::"public"."preliminary_approval_status";--> statement-breakpoint
ALTER TABLE "supplier_quotes" ALTER COLUMN "preliminary_approval_status" SET DATA TYPE "public"."preliminary_approval_status" USING "preliminary_approval_status"::"public"."preliminary_approval_status";--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_quote_id_supplier_quotes_id_fk" FOREIGN KEY ("related_quote_id") REFERENCES "public"."supplier_quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_request_id_quote_requests_id_fk" FOREIGN KEY ("related_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");