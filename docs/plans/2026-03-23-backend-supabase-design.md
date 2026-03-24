# Backend Migration — Supabase Design Document

**Goal:** Migrate Fly The Farm Dashboard from localStorage to a Supabase backend so users can log in across devices, data persists permanently, admin has full visibility, and the chemical/weed database can be crowd-sourced with automated enrichment.

**Platform:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)

**Hosting:** Frontend stays on Vercel. Supabase handles backend. Staging branch workflow for safe deployments.

**Budget:** Free tier to start ($0/month for 10-20 users), scale to $25/month Pro plan when needed.

---

## 1. Authentication & User Roles

**Provider:** Supabase Auth (email + password)

**Roles:** `admin`, `contractor`, `client`

**Flows:**
- Contractors sign up with email + password → assigned `contractor` role
- Clients sign up with a contractor's invite code → assigned `client` role, linked to that contractor
- `admin@flythefarm.com.au` is the super admin — hard-coded, full visibility of all users and all data

**Visibility:**
- **Admin:** sees every user, every contractor's data, all database requests. Can impersonate, manage chemical database, approve/dismiss requests
- **Contractor:** sees only their own clients, properties, fields, jobs, quotes, financials, kits
- **Client:** sees only jobs/quotes/spray records linked to them. Can request quotes, approve jobs

**Session:** Supabase handles JWT tokens. Users stay logged in across devices and browser refreshes.

---

## 2. Database Schema

### Migrated tables (from localStorage)

| localStorage Key | → Supabase Table | Owner Scope |
|---|---|---|
| `ftf_users` | `profiles` (extends auth.users) | — |
| `ftf_clients` | `clients` | contractor |
| `ftf_properties` | `properties` | contractor (via client) |
| `ftf_fields` | `fields` | contractor (via property) |
| `ftf_jobs` | `jobs` | contractor |
| `ftf_outcomes` | `job_outcomes` | contractor |
| `ftf_quotes` | `quotes` | contractor |
| `ftf_quote_config` | `quote_configs` | contractor |
| `ftf_kits` | `kits` | contractor |
| `ftf_actuals` | `actuals` | contractor |
| `ftf_saved_chemicals` | `saved_chemicals` | contractor |

### New tables

| Table | Purpose |
|---|---|
| `database_requests` | Chemical/weed requests from users who can't find what they need |
| `notifications` | In-app notifications (database request status updates, approvals) |

### Row-Level Security (RLS)

Every table with user data has a `contractor_user_id` column. RLS policies enforce:
- Contractors: SELECT/INSERT/UPDATE/DELETE only rows matching their auth ID
- Clients: SELECT only rows linked via their contractor + client record
- Admin: bypasses RLS — full access to everything

### Relationships

```
Contractor → Clients → Properties → Fields → Jobs → Outcomes
                                           → Quotes → Actuals
Contractor → Kits
Contractor → Quote Configs
Contractor → Saved Chemicals
```

---

## 3. File Storage

**Provider:** Supabase Storage (S3-compatible)

### Buckets

| Bucket | Contents | Access |
|---|---|---|
| `spray-recs` | Spray recommendation PDFs | Contractor who uploaded + admin |
| `field-boundaries` | KML, SHP, KMZ boundary files | Contractor + their clients (read-only) |
| `job-attachments` | Photos, site images, other uploads | Contractor + their clients (read-only) |

### Changes from current approach

- Files currently stored as base64 data URLs in localStorage → replaced with cloud file URLs
- Database stores only the file path reference, not the file itself
- PDF parsing (spray rec import) still happens client-side; PDF uploaded to storage after parsing
- File paths prefixed with contractor ID for security: `spray-recs/{contractor_id}/filename.pdf`

### Limits

Free tier: 1GB total. Expected usage for 10-20 users over 6 months: ~50-100MB.

---

## 4. Automated Chemical/Weed Database Requests

### User flow

1. User searches for a chemical or weed — no results found
2. "Can't find it? Request it" button appears
3. User submits: search term (pre-filled), type (Chemical/Weed/Insect/Fungus), optional notes
4. Request saved to `database_requests` table

### Automation flow

1. **Auto-search APVMA Registry** — searches by product name, active ingredient, registration number
2. **Auto-pull data** — product name, APVMA registration number, registrant, active constituents, category, poison schedule
3. **Generate APVMA label link** — direct link to official label PDF on APVMA PubCRIS portal
4. **Auto-generate draft entry** — creates a draft record in the chemical database with all available data, mapped to existing data structure
5. **Flag confidence levels** — green (confident), orange (needs review) for each field

### Admin notification

- **Instant email** to admin: "New auto-populated entry: Tordon 242 Herbicide — APVMA Reg #12345. [Review & Approve]"
- **Admin dashboard queue** showing:
  - All auto-filled fields with confidence indicators
  - Direct link to APVMA label PDF
  - One-click Approve (pushes entry live)
  - Edit button (tweak before approving)
  - Reject button

### After approval

- Entry goes live for all users immediately
- Requesting user gets an in-app notification: "Your requested chemical has been added"
- Admin downloads label PDF and uploads hard copy to database

### Automation coverage

- Registered chemicals (APVMA): 95-99% automated
- Weeds/pests: 80-90% automated (less structured public data)
- Admin effort: ~10 seconds per approval click

### Email delivery

Supabase Edge Functions + Resend (3,000 emails/month free).

---

## 5. Client Portal

Clients (farmers) can log in and:

- **View** their jobs, spray records, quotes, and field maps (read-only)
- **Request quotes** — submit a request with property/field details, target weed, preferred timing
- **Approve jobs** — review a quote and approve/decline it
- **Download** spray records and PDFs for their compliance needs

Clients register using their contractor's invite code. They can only see data their contractor has linked to them.

---

## 6. Migration Strategy

### Phase 1: Backend setup
- Create Supabase project
- Define all tables, relationships, RLS policies
- Build service layer that mirrors current localStorage function signatures

### Phase 2: Auth swap
- Replace localStorage auth with Supabase Auth
- Login, register, password reset through Supabase
- Seed admin account
- Server-validated invite codes

### Phase 3: Data migration
- Admin-only migration page: reads localStorage, pushes to Supabase
- After migration, remove all localStorage calls
- Existing test data preserved

### Phase 4: File storage swap
- Upload flows → Supabase Storage
- Data URLs replaced with cloud file references

### Phase 5: New features
- Database request system with APVMA auto-search
- Admin approval queue
- Email notifications
- Client portal (quote requests, job approvals)

---

## 7. Deployment & Staging

### Branching strategy
- `develop` branch → auto-deploys to staging preview URL on Vercel
- Test on staging with dummy data
- Merge `develop` → `main` → auto-deploys to production

### Supabase environments
- Single Supabase project for now (free tier)
- Upgrade to separate staging/production projects on Pro plan when needed

### Rollout
- Test on staging first
- Push to production
- New users register fresh (clean database)
- Option to run migration tool for existing testers who want to keep data

---

## 8. Cost Summary

| Service | Free Tier | Pro Tier (when needed) |
|---|---|---|
| Supabase | 50K MAU, 500MB DB, 1GB storage | $25/month |
| Vercel | Hobby (free) | $20/month (if needed) |
| Resend (email) | 3,000 emails/month | $20/month (if needed) |
| **Total** | **$0/month** | **$25-65/month** |

Free tier comfortably supports 10-20 users for 6+ months.
