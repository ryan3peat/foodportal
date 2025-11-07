# Essential Flavours Supplier Portal

## Overview
The Essential Flavours Supplier Portal is a B2B platform designed for an Australian flavour manufacturer to streamline quote request management, enhance supplier relationships, and optimize procurement workflows. The portal features role-based access control and aims to improve efficiency in the procurement process.

## User Preferences
I want to use iterative development, with a focus on completing each module end-to-end before proceeding. I prefer detailed explanations of design choices and technical implementations. For email services, I prefer not to use Replit's SendGrid integration; instead, the system should be designed for easy migration to Microsoft Graph API or another dedicated email provider. I also prefer the use of Material Design principles for the UI/UX.

## System Architecture

### Tech Stack
-   **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI
-   **Backend:** Express.js, Node.js
-   **Database:** PostgreSQL (Neon) with Drizzle ORM
-   **Authentication:** Replit Auth (OpenID Connect)
-   **Storage:** Replit Object Storage
-   **Email:** Microsoft Graph API (Outlook/M365) with HybridEmailService orchestrator

### Design System
The portal adheres to Material Design principles, utilizing the Roboto font family. It features a professional B2B aesthetic, information-dense interfaces, consistent spacing, and an accessibility-first approach.

### Core Features and Implementations

#### Module 1-2: Database & Authentication (Completed)
-   **Database Schema:** Comprehensive schema including `users`, `suppliers`, `quote_requests`, `request_suppliers`, and `supplier_quotes` tables with defined enums and relationships. Material details are embedded directly in `quote_requests`.
-   **Authentication & User Management:** Dual authentication (Replit Auth and local username/password for admin testing), role-based access control (Admin, Supplier, Procurement), protected routes, and an Admin User Management interface. Includes robust security features like bcrypt hashing, rate limiting, and email normalization.

#### Module 3: Supplier Management (Completed)
-   **CRUD Operations:** Complete supplier management with API routes and UI for listing, creating, editing, and deleting suppliers.
-   **Multiple Email Support:** Extended supplier schema with `email2` field to support secondary contact emails. Suppliers can have up to two email addresses (primary and secondary).
-   **CSV Import:** Successfully imported 19 suppliers from CSV file with automatic email splitting for suppliers with multiple contacts.
-   **Data Validation:** Form validation ensures proper email format for both primary and secondary email fields.
-   **Critical Bug Fix:** Resolved incorrect parameter order in `apiRequest()` function. Changed signature from `(method, url, data)` to `(url, method, data)` to match intuitive usage pattern and fix delete operations.

#### Module 4-5: Quote Request Workflow (Completed)
-   **Quote Request Creation:** A 4-step multi-step wizard for creating quote requests, including material details, specifications, supplier selection, and review. Features draft saving, auto-generated RFQ numbers (RFQ-YYYY-XXXXX), and date handling.
-   **Email Notifications:** Professional HTML email templates for RFQ notifications, sent to selected suppliers with token-based authentication links for quote submission. Includes a secure 64-character random access token system with 30-day expiration.

#### Module 6: Supplier Quote Submission (Completed)
-   **Public Quote Submission Interface:** A token-based public page at `/quote-submission/:id?token=xxx` that allows suppliers to submit quotes without login. Features:
    -   Token validation middleware with automatic expiration checking (30-day validity)
    -   Quote request details display (material, quantity, specifications, deadline)
    -   Quote submission form with fields: price per unit, lead time, MOQ, payment terms, additional notes
    -   Currency support (AUD default)
    -   Success page with confirmation message
    -   Fully tested end-to-end workflow with E2E tests
-   **Critical Technical Fix:** Resolved frontend routing issue where wouter's `useLocation()` only returns pathname. Fixed by using `window.location.search` for query parameter extraction, enabling proper token validation on public routes.

#### Module 7: Quote Comparison & Review (Completed)
-   **Quote Request Detail Page:** Comprehensive detail page at `/quote-requests/:id` displaying:
    -   Summary cards showing: quotes received count (X/Y format), submit-by date, and best quote price
    -   Material details section compressed to 1 row with 4 columns: Material Name, Quantity, CAS Number, FEMA Number
    -   Supplier Quotes Comparison: 3-column card layout displaying top 3 quotes ordered by best price (lowest to highest)
    -   Each supplier card shows: Price per Unit (prominent), MOQ, Lead Time, Payment Terms, and "Select Quote" button
    -   Best price quote highlighted with primary border, background tint, and "Best Price" badge
-   **Enhanced API Endpoint:** Modified `GET /api/quote-requests/:id` to return joined data from `quote_requests`, `request_suppliers`, and `supplier_quotes` tables with complete quote information
-   **Quotes Received Column:** Added to Quote Requests list table showing "X / Y" format (quotes received / total suppliers) with green badge indicator when quotes are received
-   **Backend Optimization:** Implemented Set-based deduplication in `getQuoteRequests()` to accurately count unique suppliers and submitted quotes per request
-   **Critical Bug Fixes:** 
    -   Resolved foreign key constraint violation in `upsertUser()` method that occurred during OIDC login. Fix excludes the `id` field from update operations to prevent attempts to modify primary keys referenced by other tables.
    -   Fixed Create Supplier button by adding `createdBy` to `insertSupplierSchema` omit block, allowing frontend validation to pass without providing server-populated fields.

#### Module 8: Microsoft Graph Email Integration (Completed)
-   **MicrosoftGraphEmailService:** Production-ready email service that sends RFQ notifications via Microsoft Graph API using Azure app registration credentials. Emails sent from ryanc@essentialflavours.com.au.
-   **HybridEmailService:** Service orchestrator that supports environment-driven email provider selection with optional fallback support:
    -   **EMAIL_PROVIDER:** Set to `graph` (production) or `mock` (development/testing)
    -   **ALLOW_MOCK_FALLBACK:** Enable automatic fallback to mock service if Graph API fails (development only)
-   **Accurate Audit Trail:** The `emailSentAt` timestamp in `request_suppliers` table is only set on confirmed successful email delivery
-   **Comprehensive Error Handling:** Graph API failures are logged with actionable diagnostics; system surfaces failures for operational visibility
-   **Azure Credentials:** Configured via Replit secrets (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, SENDER_EMAIL)
-   **E2E Testing:** Successfully tested end-to-end with real email delivery via Microsoft Graph API

#### Module 9: Authenticated Supplier Portal (In Progress)
-   **Database Schema Extensions:** Extended `supplier_quotes` table with comprehensive product and shipping fields:
    -   **Product Details:** packSize, shelfLife, storageRequirements, dangerousGoodsHandling
    -   **Shipping & Logistics:** shippingTerms, freightCost (numeric with 2 decimal precision)
    -   **Preliminary Approval:** preliminaryApprovalStatus (pending/approved/rejected), preliminaryApprovedAt, preliminaryApprovedBy
-   **Supplier Documents Table:** Created `supplier_documents` table for post-approval document uploads with foreign key to `supplier_quotes`. Supports document types: COA, PIF, Specification, SDS, Halal/Kosher/Organic certificates, GFSI certification, process flow diagrams, natural status declarations
-   **Supplier Authentication Middleware:** `requireSupplierAccess` middleware matches logged-in users (Replit Auth) to supplier records via email (checks both email and email2 fields), verifies supplier has received quote requests, and attaches supplier context to requests
-   **Supplier API Endpoints:**
    -   GET /api/supplier/dashboard - Dashboard statistics (ongoing/outstanding/expired/approved quote counts)
    -   GET /api/supplier/quote-requests - List all quote requests for authenticated supplier
    -   GET /api/supplier/quote-requests/:requestId - Detailed view of specific quote request with access validation
    -   POST /api/supplier/quotes - Submit or update quotes with comprehensive validation
    -   GET/POST /api/supplier/quotes/:quoteId/documents - Document management (post-approval)
    -   PATCH /api/supplier/quotes/:quoteId/preliminary-approval - Admin approval workflow
-   **Supplier Dashboard UI:** Tabbed interface with Material Design aesthetics showing:
    -   Statistics cards: Ongoing Requests, Outstanding Quotes, Expired Requests, Approved Quotes
    -   Tabbed views: Ongoing (active requests), Under Review (submitted quotes), Approved (ready for documents), Expired (past deadline)
    -   Real-time data with loading states and empty state handling
-   **Enhanced Quote Submission Form:** Comprehensive form organized into logical sections:
    -   Pricing & Terms: Price per unit, pack size, MOQ, payment terms
    -   Shipping & Logistics: Lead time to Melbourne, freight cost, shipping terms
    -   Product Information: Shelf life, storage requirements, dangerous goods handling
    -   Form validation with Zod schemas, proper TypeScript typing, loading/error states
-   **Navigation & Routing:** Dedicated supplier routes (/supplier/dashboard, /supplier/quote-requests/:id) with sidebar navigation for supplier role
-   **Critical Bug Fixes:**
    -   Fixed query key to call correct detail endpoint (`/api/supplier/quote-requests/${requestId}`) instead of list endpoint
    -   Moved form reset logic to useEffect for proper data hydration on quote updates
    -   Added explicit null coalescing for optional form fields to prevent TypeScript errors
-   **Remaining Tasks:** Document upload UI with object storage integration, admin preliminary approval workflow interface, end-to-end testing

### System Design Choices
-   **Modular Development:** The project is built in modular phases, ensuring each feature set is complete and testable.
-   **Role-Based Access Control (RBAC):** Granular permissions for Admin, Supplier, and Procurement roles.
-   **Token-Based Supplier Access:** Enables frictionless quote submission for suppliers without requiring traditional login. Uses 64-character cryptographically random tokens with 30-day expiration.
-   **Auto-generated RFQ Numbers:** Consistent and trackable request numbering (format: RFQ-YYYY-XXXXX).
-   **Data Validation:** Extensive use of Zod for schema validation on the backend.
-   **Public vs Authenticated Routes:** Separate routing structure to render public pages (quote submission) without authentication layouts, while maintaining secure authenticated routes for internal users.

## External Dependencies
-   **PostgreSQL (Neon):** Primary database for data persistence.
-   **Replit Auth (OpenID Connect):** Used for user authentication.
-   **Replit Object Storage (Google Cloud Storage):** For file uploads.
-   **Microsoft Graph API:** Production email service for sending RFQ notifications via Outlook/M365 (ryanc@essentialflavours.com.au).

## Environment Variables
The following environment variables are required for the application to function properly:

### Authentication
-   **SESSION_SECRET:** Secret key for Express session encryption (auto-configured by Replit)

### Database
-   **DATABASE_URL:** PostgreSQL connection string (auto-configured by Replit)
-   **PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE:** PostgreSQL connection parameters (auto-configured by Replit)

### Email Service (Microsoft Graph API)
-   **AZURE_TENANT_ID:** Azure AD tenant ID for M365 organization
-   **AZURE_CLIENT_ID:** Azure app registration client ID
-   **AZURE_CLIENT_SECRET:** Azure app registration client secret value (not secret ID)
-   **SENDER_EMAIL:** Email address to send from (e.g., ryanc@essentialflavours.com.au)
-   **EMAIL_PROVIDER:** Email provider selection - `graph` (default, production) or `mock` (development/testing)
-   **ALLOW_MOCK_FALLBACK:** Enable mock email fallback - `true` (development) or `false` (default, production)

### Object Storage
-   **DEFAULT_OBJECT_STORAGE_BUCKET_ID:** Replit object storage bucket ID (auto-configured)
-   **PUBLIC_OBJECT_SEARCH_PATHS:** Public asset search paths (auto-configured)
-   **PRIVATE_OBJECT_DIR:** Private object directory (auto-configured)