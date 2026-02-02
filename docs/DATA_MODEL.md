# HRTAJ Real Estate - Data Model Notes

This document summarizes the core entities and relationships used in the HRTAJ Real Estate marketplace, partner portal, and admin CRM.

## Core Identity
- `auth.users` (Supabase Auth): system users.
- `profiles` (1:1 with `auth.users`):
  - `profiles.id` references `auth.users.id`
- `role`: `owner` | `admin` | `ops` | `staff` | `agent` | `developer`
  - `full_name`, `phone`, timestamps
- `staff_profiles` (contract + access control):
  - `user_id` -> `auth.users.id`
  - `contract_status`: `pending` | `active` | `suspended` | `expired`
  - `can_view_owner` gate for sensitive owner data

## Partners / Developers
- `developers`: partner companies (real estate developers).
- `developer_members`:
  - `developer_id` -> `developers.id`
  - `user_id` -> `auth.users.id`
  - compound PK: (`developer_id`, `user_id`)

## Listings (Marketplace Units)
- `listings`:
  - `owner_user_id` -> `auth.users.id`
  - `developer_id` -> `developers.id` (nullable)
  - `inventory_source`: `resale` | `project`
  - `submission_status`: workflow state for partner/staff submissions
  - `listing_code` + `unit_code` (internal + partner codes)
  - `status`: `draft` | `published` | `archived`
- `unit_status`: `available` | `reserved` | `sold` | `rented` | `off_market` | `on_hold` (legacy)
  - public-facing ops fields (agent, floor, finishing, meters, reception, view, building, commission, ad channel)
  - price + location + specs (beds/baths/size)
  - `amenities` (jsonb)
- `listing_images`:
  - `listing_id` -> `listings.id`
  - `path`, `sort`

## Resale Intake (Staff-Only)
- `resale_intake`:
  - `listing_id` -> `listings.id` (1:1)
  - owner/agent details (private fields)
  - owner contact log: `last_owner_contact_at`, `next_owner_followup_at`, `last_owner_contact_note`, `owner_notes`
  - intake metadata (commission, ad channel, notes)
  - used only by HRTAJ staff (RLS restricted)

## Unit Attachments (Staff & Published Media)
- `unit_attachments`:
  - `listing_id` -> `listings.id`
  - file path + type + category
  - `bucket` supports separate storage for private docs
  - `is_primary` for gallery cover
  - `is_published` controls public visibility
  - supports image, pdf, video, doc

## Developer Projects (New Developments)
- `projects`:
  - `developer_id` -> `developers.id`
  - localized title/description (AR/EN)
  - `submission_status` and workflow timestamps
- `submission_media`:
  - files for projects or listings (brochure/floorplan/images)
- `submission_notes`:
  - HRTAJ review notes & feedback

## Favorites
- `favorites`:
  - `user_id` -> `auth.users.id`
  - `listing_id` -> `listings.id`
  - compound PK (`user_id`, `listing_id`)

## CRM Leads
- `leads`:
  - `listing_id` -> `listings.id`
  - `customer_id` -> `customers.id`
  - `user_id` -> `auth.users.id` (nullable for guest)
  - `status`: `new` | `contacted` | `qualified` | `meeting_set` | `follow_up` | `negotiation` | `won` | `lost`
  - `lead_source` + `phone_normalized` + `phone_e164` + `priority`
  - `lost_reason` + `lost_reason_note` (required when reason = other)
  - `assigned_to` -> `auth.users.id` (nullable)
  - `next_followup_at` + `next_action_at` (nullable)
  - `updated_at`, `first_response_at`, `last_contact_at` for SLA tracking
- `customers`:
  - unique `phone_e164` (dedup anchor)
  - `full_name`, `email`, `intent`, `preferred_areas`, budgets
  - linked to leads and activities
- `lead_notes`:
  - `lead_id` -> `leads.id`
  - `author_user_id` -> `auth.users.id`
  - note text + timestamps
- `lead_activities`:
  - activity log for calls/meetings/notes
  - `lead_id` / `customer_id` + `activity_type`, `outcome`, `notes`
- `lead_sources`:
  - managed dictionary for source tracking
- `lead_spend`:
  - channel spend per month for CPL reporting
- `field_visits`:
  - scheduled inspections linked to listings/leads
  - `assigned_to` -> `auth.users.id`
  - status + outcome + follow-up

## Audit & Settings
- `audit_log`:
  - security-sensitive actions (role changes, exports, publishing)
  - `actor_user_id`, `action`, `entity_type`, `entity_id`, `metadata`
- `site_settings`:
  - public contact links (facebook, email, whatsapp)

## Careers
- `career_applications`:
  - public applications with CV uploads
  - status workflow: `new` -> `reviewing` -> `interview` -> `offer` -> `hired` | `rejected`

## Reporting (Admin)
- `report_units_per_day`, `report_leads_per_day`, `report_leads_per_listing`, `report_top_developers`
  - Aggregated views that respect RLS (security invoker).
  - Only admins should query these in the app.

## RLS Summary
- Public users can read published listings + images.
- Owners and developer members can read/manage their listings and related leads.
- Admins can access all records and reports.
