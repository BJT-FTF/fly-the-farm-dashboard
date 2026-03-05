# Fly the Farm Dashboard — Product Requirements Document

## 1. Overview

**Product Name:** Fly the Farm Dashboard
**Version:** 1.0 (Production)
**Owner:** Fly the Farm (flythefarm.com.au)
**Platform:** Web application (React + TypeScript)

### Vision
The industry-leading agricultural chemical reference and recommendation dashboard purpose-built for drone pilots. Users search by chemical or weed/pest and receive comprehensive drone-specific application guidance — rates, mixing instructions, drone settings, and regulatory compliance — all tailored for aerial spraying in Australia.

### Problem Statement
Drone pilots currently piece together chemical application data from product labels, manufacturer PDFs, and tribal knowledge. There is no single, drone-specific reference tool that combines chemical data with aerial application best practices. Fly the Farm Dashboard solves this by providing an authoritative, searchable chemical repository optimised for drone spraying operations.

---

## 2. Target Users

**Primary:** Professional agricultural drone pilots operating in Australia
**Secondary:** Farm operators who hire or work alongside drone spraying services

### User Persona
- Operates DJI Agras drones (T10 through T50) for commercial spraying
- Needs quick access to chemical rates, mixing ratios, and drone settings in the field
- Must comply with APVMA regulations and state-specific restrictions
- Values speed, accuracy, and mobile-friendly access

---

## 3. Core Features

### 3.1 Chemical & Weed Search (Free Tier)
**Two search modes:**

1. **Search by Chemical/Product** — Enter a chemical name or active ingredient to see:
   - Basic product information (name, active ingredient, manufacturer)
   - Target weeds/pests it treats
   - General application overview

2. **Search by Weed/Pest** — Enter a weed or pest name to see:
   - Recommended chemicals for treatment
   - Basic application overview

**Free tier limitations:** Basic chemical info only. Drone settings, detailed rates, and regulatory data require Pro.

### 3.2 Detailed Chemical Data (Pro Tier)

Each chemical entry includes the following data sets:

#### Rates & Mixing
- Application rates (mL/ha, L/ha)
- Water volume per hectare
- Mixing ratios and order of mixing
- Required adjuvants/surfactants
- Tank mix compatibility notes

#### Drone Application Settings
- Recommended flight height (m AGL)
- Flight speed (m/s)
- Nozzle type and size
- Droplet size category (VMD)
- Swath width
- Flow rate (L/min)
- Recommended overlap percentage

#### Regulatory Information (Australian — APVMA)
- APVMA registration number and status
- Restricted use / permit requirements
- Buffer zone distances (waterways, sensitive areas)
- Re-entry interval (REI)
- Withholding period (WHP)
- State-specific restrictions or permits

#### Target & Timing
- Target weeds/pests with efficacy ratings
- Compatible crop types
- Optimal weed growth stage for application
- Temperature range restrictions
- Maximum wind speed for application
- Rain-free period required
- Time-of-day recommendations

### 3.3 Mix Calculator (Pro Tier)

A practical tool for calculating exact chemical quantities per tank load.

**Inputs:**
- Select drone model (pre-configured) or enter custom tank size
- Total area to spray (hectares)
- Selected chemical and target rate
- Water volume rate (L/ha)

**Outputs:**
- Chemical quantity per tank load
- Water quantity per tank load
- Number of tank loads required for total area
- Adjuvant/surfactant quantities if applicable
- Total chemical and water needed for the job

**Pre-configured DJI Agras Models:**
| Model | Tank Capacity |
|-------|--------------|
| T10   | 8L           |
| T20   | 20L          |
| T25   | 20L          |
| T30   | 30L          |
| T40   | 40L          |
| T50   | 50L          |
| T100  | 100L         |

### 3.4 Favourites & Search History (Pro Tier)

- Save chemicals and mixes to a personal favourites list
- View recent search history
- Quick-access to frequently used chemicals
- Organise favourites by category or custom tags

### 3.5 Spray Job Logs (Pro Tier)

Log and track spray operations with the following fields:

**Per job entry:**
- Date and time
- Location / paddock name
- Chemical(s) used with rates
- Total area sprayed (ha)
- Drone model used
- Weather conditions:
  - Temperature
  - Wind speed and direction
  - Humidity
  - Delta T
- Crop type
- Crop/weed growth stage
- Applicator name
- Notes field

**Log features:**
- Searchable and filterable log history
- Export to CSV/PDF
- Summary statistics (total hectares sprayed, chemical usage over time)

---

## 4. Chemical Data Repository

### Data Strategy
- Build an initial repository of the most commonly used agricultural chemicals for drone spraying in Australia
- Data sourced from APVMA public registers, product labels, and manufacturer specifications
- Drone-specific application data compiled from DJI recommendations, industry best practices, and field experience
- When a user searches for a chemical not in the repository, flag it for research and addition

### Initial Chemical Categories
- Herbicides (broadleaf, grass-selective, knockdown)
- Insecticides
- Fungicides
- Plant growth regulators
- Desiccants
- Adjuvants and surfactants

### Data Quality
- Each entry reviewed for accuracy against current APVMA label
- Drone application settings validated against manufacturer recommendations
- Regular updates when labels or registrations change

---

## 5. Authentication & Accounts

### Method
- Email and password registration/login

### Account Tiers

**Free Tier:**
- Chemical and weed/pest search
- Basic product information (name, active ingredient, targets)
- Limited to basic data views

**Pro Tier (Paid Subscription):**
- Full chemical data (rates, mixing, drone settings, regulatory info)
- Mix calculator with all DJI Agras presets
- Favourites and search history
- Spray job logging with export
- Priority access to newly added chemicals

---

## 6. Design & Branding

### Visual Identity
- Align with existing Fly the Farm brand (flythefarm.com.au)
- Primary colour: Dark teal (#023335) — sourced from current website
- Additional brand colours to be confirmed by stakeholder
- Clean, professional aesthetic appropriate for a paid SaaS tool
- Rounded UI elements (10px border-radius consistent with current site)

### Layout
- Responsive design — must work well on tablets and phones (field use)
- Search-first interface — prominent search bar on dashboard home
- Card-based results display
- Clear visual hierarchy separating free vs pro data sections

### Key Screens
1. **Login / Registration**
2. **Dashboard Home** — Search bar, recent searches, quick stats
3. **Search Results** — List of matching chemicals or weeds
4. **Chemical Detail** — Full data card with all sections (rates, drone settings, regulatory, targets)
5. **Weed/Pest Detail** — Recommended chemicals with comparison view
6. **Mix Calculator** — Input form with real-time calculation results
7. **Spray Log** — List view with add/edit forms
8. **Favourites** — Saved chemicals grid/list
9. **Account / Settings** — Profile, subscription management
10. **Subscription / Upgrade** — Pricing page with tier comparison

---

## 7. Technical Architecture

### Frontend (This Repository)
- **Framework:** React 19 + TypeScript
- **UI Library:** Material UI v7 (MUI)
- **Routing:** React Router DOM v7
- **Charts/Viz:** Recharts v3 (for spray log statistics)
- **Build Tool:** Create React App (react-scripts)

### Backend (TBD)
- REST API for chemical data, auth, and user operations
- Database for chemical repository, user accounts, spray logs
- Search indexing for fast chemical/weed lookups

### Data Storage Needs
- Chemical repository (structured data per entry)
- User accounts and authentication
- User favourites and search history
- Spray job logs per user
- Subscription/payment status

---

## 8. Metrics for Success

- Chemical database size (target: 100+ entries at launch)
- Search accuracy (users find what they need on first query)
- User registration rate
- Free-to-Pro conversion rate
- Daily active users
- Spray logs created per user per week

---

## 9. Phased Delivery

### Phase 1 — Foundation
- Authentication (email/password)
- Chemical data repository (initial dataset)
- Search by chemical and search by weed
- Chemical detail pages (all data sections)
- Responsive layout with Fly the Farm branding

### Phase 2 — Pro Tools
- Mix calculator with DJI Agras presets
- Favourites and search history
- Subscription tier gating (free vs pro)

### Phase 3 — Spray Logs
- Spray job logging with all detailed fields
- Log history with search/filter
- Export to CSV/PDF
- Usage statistics and charts

### Phase 4 — Growth
- Payment integration (Stripe or similar)
- "Chemical not found" request system
- Community-requested chemical additions
- Performance optimisation and SEO

---

## 10. Open Questions

- [ ] Exact brand colour palette (beyond #023335) — awaiting stakeholder input
- [ ] Backend technology choice (Node.js, Python, BaaS?)
- [ ] Payment provider preference (Stripe?)
- [ ] Initial chemical dataset scope — which chemicals to prioritise first?
- [ ] Mobile app plans (React Native?) or PWA sufficient?
- [ ] Legal disclaimer requirements for chemical application advice
