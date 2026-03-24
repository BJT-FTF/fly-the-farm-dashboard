# Backend Migration to Supabase — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Fly The Farm Dashboard from localStorage to Supabase so users can log in across devices, data persists permanently, admin has full visibility, and the chemical/weed database supports crowd-sourced requests with automated enrichment.

**Architecture:** Frontend stays on Vercel (React + TypeScript + MUI). Backend moves to Supabase (PostgreSQL + Auth + Storage + Edge Functions). Service layer is refactored to swap localStorage calls for Supabase client calls while keeping the same function signatures so pages don't need rewriting. Staging branch workflow for safe deployments.

**Tech Stack:** React 19, TypeScript, Supabase JS Client v2, Supabase Auth, PostgreSQL with RLS, Supabase Storage, Supabase Edge Functions, Resend (email)

**Design Doc:** `docs/plans/2026-03-23-backend-supabase-design.md`

---

## Phase 1: Supabase Project Setup & Database Schema

### Task 1: Create Supabase project and install client

**Files:**
- Create: `src/services/supabaseClient.ts`
- Modify: `package.json`

**Step 1: Create Supabase project**

Go to https://supabase.com and create a new project called `fly-the-farm`. Note down:
- Project URL (e.g. `https://xxxx.supabase.co`)
- Anon public key (found in Settings → API)

**Step 2: Install Supabase JS client**

```bash
npm install @supabase/supabase-js
```

**Step 3: Add environment variables**

Create `.env.local` (already in `.gitignore`):
```
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Create `.env.example` (for other developers):
```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```

**Step 4: Create Supabase client helper**

```typescript
// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Step 5: Add Supabase env vars to Vercel**

In Vercel project settings → Environment Variables, add:
- `REACT_APP_SUPABASE_URL` — for both Preview and Production
- `REACT_APP_SUPABASE_ANON_KEY` — for both Preview and Production

**Step 6: Commit**

```bash
git add src/services/supabaseClient.ts .env.example package.json package-lock.json
git commit -m "feat: add Supabase client setup and environment config"
```

---

### Task 2: Create database schema — profiles and auth

**Files:**
- Run in Supabase SQL Editor (Dashboard → SQL Editor)

**Step 1: Create profiles table**

Run this SQL in the Supabase SQL Editor:

```sql
-- Profiles table extends Supabase auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null default 'contractor' check (role in ('admin', 'contractor', 'client')),
  contractor_id uuid references public.profiles(id),  -- for clients: their contractor
  client_record_id text,  -- for clients: linked business record
  invite_code text unique,  -- for contractors: shareable code
  tier text not null default 'free' check (tier in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Admin sees all profiles
create policy "Admin sees all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Contractors can see their clients' profiles
create policy "Contractors see their clients"
  on public.profiles for select
  using (contractor_id = auth.uid());

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Anyone can insert their own profile (during registration)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'contractor')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed admin account (run AFTER creating admin via Supabase Auth dashboard or signup)
-- This will be handled by the app on first admin signup
```

**Step 2: Commit migration notes**

Create a file tracking which SQL has been applied:

```bash
mkdir -p supabase/migrations
```

Save the SQL above as `supabase/migrations/001_profiles.sql` for reference.

```bash
git add supabase/migrations/001_profiles.sql
git commit -m "feat: add profiles table schema with RLS policies"
```

---

### Task 3: Create database schema — field management tables

**Files:**
- Run in Supabase SQL Editor
- Save as: `supabase/migrations/002_field_management.sql`

**Step 1: Create clients, properties, fields, jobs, outcomes tables**

```sql
-- ─── Clients ────────────────────────────────────────────
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Contractors manage own clients"
  on public.clients for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all clients"
  on public.clients for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients see own record"
  on public.clients for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.contractor_id = clients.contractor_user_id
        and p.client_record_id = clients.id::text
    )
  );

-- ─── Properties ─────────────────────────────────────────
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  address text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "Contractors manage own properties"
  on public.properties for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all properties"
  on public.properties for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Fields ─────────────────────────────────────────────
create table public.fields (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  hectares numeric default 0,
  boundary_file_url text,  -- Supabase Storage path instead of data URL
  boundary_type text,  -- 'kml', 'shp', 'kmz'
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fields enable row level security;

create policy "Contractors manage own fields"
  on public.fields for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all fields"
  on public.fields for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Jobs ───────────────────────────────────────────────
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete cascade,
  quote_id uuid,
  weed_target text not null,
  date_sprayed text not null,
  status text default 'pending',
  chemicals jsonb default '[]',  -- ChemicalEntry[] stored as JSON
  batch_info jsonb,  -- BatchInfo stored as JSON
  weather_log jsonb default '[]',  -- WeatherLogEntry[] stored as JSON
  spray_rec_file_url text,  -- Supabase Storage path
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Contractors manage own jobs"
  on public.jobs for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all jobs"
  on public.jobs for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Job Outcomes ───────────────────────────────────────
create table public.job_outcomes (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  efficacy_rating integer check (efficacy_rating between 1 and 5),
  follow_up_required boolean default false,
  follow_up_notes text default '',
  photos jsonb default '[]',  -- array of Storage URLs
  assessed_at text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_outcomes enable row level security;

create policy "Contractors manage own outcomes"
  on public.job_outcomes for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all outcomes"
  on public.job_outcomes for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
```

**Step 2: Commit**

```bash
git add supabase/migrations/002_field_management.sql
git commit -m "feat: add field management tables (clients, properties, fields, jobs, outcomes)"
```

---

### Task 4: Create database schema — quotes, kits, financials

**Files:**
- Run in Supabase SQL Editor
- Save as: `supabase/migrations/003_quotes_financials.sql`

**Step 1: Create quotes, quote configs, kits, actuals tables**

```sql
-- ─── Quote Configs ──────────────────────────────────────
create table public.quote_configs (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade unique,
  config jsonb not null default '{}',  -- full QuoteConfig object as JSON
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quote_configs enable row level security;

create policy "Contractors manage own quote config"
  on public.quote_configs for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all quote configs"
  on public.quote_configs for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Kits ───────────────────────────────────────────────
create table public.kits (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  kit_data jsonb not null default '{}',  -- full Kit object as JSON
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kits enable row level security;

create policy "Contractors manage own kits"
  on public.kits for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all kits"
  on public.kits for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Quotes ─────────────────────────────────────────────
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id),
  quote_data jsonb not null default '{}',  -- full Quote object as JSON
  status text default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotes enable row level security;

create policy "Contractors manage own quotes"
  on public.quotes for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all quotes"
  on public.quotes for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients see own quotes"
  on public.quotes for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.client_record_id = quotes.client_id::text
    )
  );

-- ─── Actuals (Financials) ───────────────────────────────
create table public.actuals (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  actual_data jsonb not null default '{}',  -- full JobActual object as JSON
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.actuals enable row level security;

create policy "Contractors manage own actuals"
  on public.actuals for all
  using (contractor_user_id = auth.uid());

create policy "Admin sees all actuals"
  on public.actuals for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Saved Chemicals ───────────────────────────────────
create table public.saved_chemicals (
  id uuid primary key default gen_random_uuid(),
  contractor_user_id uuid not null references public.profiles(id) on delete cascade,
  chemical_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.saved_chemicals enable row level security;

create policy "Contractors manage own saved chemicals"
  on public.saved_chemicals for all
  using (contractor_user_id = auth.uid());
```

**Step 2: Commit**

```bash
git add supabase/migrations/003_quotes_financials.sql
git commit -m "feat: add quotes, kits, actuals, saved chemicals tables"
```

---

### Task 5: Create database schema — database requests and notifications

**Files:**
- Run in Supabase SQL Editor
- Save as: `supabase/migrations/004_database_requests.sql`

**Step 1: Create database requests and notifications tables**

```sql
-- ─── Database Requests ──────────────────────────────────
create table public.database_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(id) on delete cascade,
  search_term text not null,
  request_type text not null check (request_type in ('chemical', 'weed', 'insect', 'fungus')),
  notes text default '',
  status text not null default 'pending' check (status in ('pending', 'searching', 'ready_for_review', 'approved', 'dismissed')),

  -- Auto-populated by APVMA lookup
  apvma_data jsonb,  -- auto-fetched product data
  label_url text,  -- link to APVMA label PDF
  draft_entry jsonb,  -- auto-generated database entry for review
  confidence text check (confidence in ('high', 'medium', 'low')),

  -- Admin actions
  admin_notes text default '',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.database_requests enable row level security;

-- Users can create requests
create policy "Users can create requests"
  on public.database_requests for insert
  with check (requested_by = auth.uid());

-- Users can see their own requests
create policy "Users see own requests"
  on public.database_requests for select
  using (requested_by = auth.uid());

-- Admin sees and manages all requests
create policy "Admin manages all requests"
  on public.database_requests for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Notifications ──────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'request')),
  read boolean default false,
  link text,  -- optional in-app link
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users see own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can mark own notifications read"
  on public.notifications for update
  using (user_id = auth.uid());

-- Admin and system can create notifications for anyone
create policy "Admin creates notifications"
  on public.notifications for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or user_id = auth.uid()
  );
```

**Step 2: Commit**

```bash
git add supabase/migrations/004_database_requests.sql
git commit -m "feat: add database requests and notifications tables"
```

---

### Task 6: Create storage buckets

**Files:**
- Configure in Supabase Dashboard (Storage → New Bucket)

**Step 1: Create buckets**

In Supabase Dashboard → Storage, create three buckets:

1. **`spray-recs`** — Private, 10MB file size limit
2. **`field-boundaries`** — Private, 10MB file size limit
3. **`job-attachments`** — Private, 10MB file size limit

**Step 2: Set storage policies**

Run in SQL Editor:

```sql
-- Spray Recs: contractors upload/read own files
create policy "Contractors manage own spray recs"
  on storage.objects for all
  using (
    bucket_id = 'spray-recs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Field Boundaries: contractors upload/read own files
create policy "Contractors manage own boundaries"
  on storage.objects for all
  using (
    bucket_id = 'field-boundaries'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Job Attachments: contractors upload/read own files
create policy "Contractors manage own attachments"
  on storage.objects for all
  using (
    bucket_id = 'job-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin can read all files in all buckets
create policy "Admin reads all spray recs"
  on storage.objects for select
  using (
    bucket_id = 'spray-recs'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin reads all boundaries"
  on storage.objects for select
  using (
    bucket_id = 'field-boundaries'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin reads all attachments"
  on storage.objects for select
  using (
    bucket_id = 'job-attachments'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
```

Save as `supabase/migrations/005_storage_policies.sql`.

**Step 3: Commit**

```bash
git add supabase/migrations/005_storage_policies.sql
git commit -m "feat: add storage bucket policies for spray-recs, boundaries, attachments"
```

---

## Phase 2: Auth Swap

### Task 7: Create new AuthContext with Supabase Auth

**Files:**
- Create: `src/contexts/SupabaseAuthContext.tsx`
- Modify: `src/contexts/AuthContext.tsx` (rename to `AuthContext.old.tsx` as backup)

**Step 1: Build the new auth context**

```typescript
// src/contexts/SupabaseAuthContext.tsx
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export type UserRole = 'admin' | 'contractor' | 'client';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  contractorId?: string;
  clientRecordId?: string;
  inviteCode?: string;
  tier: 'free' | 'pro';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    name: string,
    password: string,
    role: UserRole,
    contractorCode?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Generate a 6-character invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<AppUser | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      contractorId: data.contractor_id || undefined,
      clientRecordId: data.client_record_id || undefined,
      inviteCode: data.invite_code || undefined,
      tier: data.tier as 'free' | 'pro',
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const profile = await fetchProfile(s.user);
        setUser(profile);
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user) {
          const profile = await fetchProfile(s.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const register = useCallback(async (
    email: string,
    name: string,
    password: string,
    role: UserRole,
    contractorCode?: string,
  ) => {
    // If registering as client, validate invite code
    let contractorId: string | undefined;
    if (role === 'client' && contractorCode) {
      const { data: contractor } = await supabase
        .from('profiles')
        .select('id')
        .eq('invite_code', contractorCode.toUpperCase())
        .single();

      if (!contractor) {
        return { success: false, error: 'Invalid invite code' };
      }
      contractorId = contractor.id;
    }

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },  // passed to handle_new_user trigger
      },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Registration failed' };

    // Update profile with additional fields
    const profileUpdates: Record<string, unknown> = { name };
    if (role === 'contractor') {
      profileUpdates.invite_code = generateInviteCode();
    }
    if (role === 'client' && contractorId) {
      profileUpdates.contractor_id = contractorId;
    }

    await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', data.user.id);

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<AppUser>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.tier !== undefined) dbUpdates.tier = updates.tier;
    dbUpdates.updated_at = new Date().toISOString();

    await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Step 2: Swap the context in App.tsx**

Replace the import in `src/App.tsx`:
```typescript
// Old:
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// New:
import { AuthProvider, useAuth } from './contexts/SupabaseAuthContext';
```

Do the same in every file that imports from `AuthContext`:
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/components/Layout.tsx`
- All pages that call `useAuth()`

Search: `grep -r "from '../contexts/AuthContext'" src/` and update each import.

**Step 3: Update Login page**

The `login()` function now returns `{ success, error }` instead of just `boolean`. Update the login handler to show `error` messages from Supabase.

**Step 4: Update Register page**

The `register()` function signature stays the same. No changes needed if it already handles `{ success, error }`.

**Step 5: Add loading state to App**

Wrap the router in a loading check so the app doesn't flash the login page while checking session:

```typescript
const { loading } = useAuth();
if (loading) return <LoadingSpinner />;
```

**Step 6: Commit**

```bash
git add src/contexts/SupabaseAuthContext.tsx src/App.tsx
git add -A  # catch all import updates
git commit -m "feat: swap localStorage auth for Supabase Auth with JWT sessions"
```

---

## Phase 3: Service Layer Migration

### Task 8: Create Supabase service for field management

**Files:**
- Create: `src/services/supabaseFieldManagementStore.ts`

**Step 1: Build the service**

This file mirrors every function from `fieldManagementStore.ts` but uses Supabase queries instead of localStorage. Key pattern:

```typescript
import { supabase } from './supabaseClient';
import { Client, Property, Field, JobRecord, JobOutcome } from '../types/fieldManagement';

// ─── Clients ────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  return data || undefined;
}

export async function saveClient(
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Client> {
  const { data: result, error } = await supabase
    .from('clients')
    .insert({
      contractor_user_id: data.contractorUserId,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      notes: data.notes || '',
    })
    .select()
    .single();
  if (error) throw error;
  return mapClientRow(result);
}

// ... same pattern for updateClient, deleteClient
// ... same pattern for Properties, Fields, Jobs, Outcomes
// ... same pattern for summary functions (use Supabase aggregate queries)
```

**Important:** All functions become `async` and return `Promise<T>`. The pages calling these functions will need `await` or be wrapped in `useEffect` / React Query.

**Step 2: Create a wrapper hook for async data fetching**

Create `src/hooks/useSupabaseQuery.ts` — a simple hook that handles loading/error states for Supabase calls:

```typescript
import { useState, useEffect, useCallback } from 'react';

export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
```

**Step 3: Commit**

```bash
git add src/services/supabaseFieldManagementStore.ts src/hooks/useSupabaseQuery.ts
git commit -m "feat: add Supabase field management service with async query hook"
```

---

### Task 9: Create Supabase services for quotes, financials, saved chemicals

**Files:**
- Create: `src/services/supabaseQuoteStore.ts`
- Create: `src/services/supabaseFinancialsStore.ts`
- Create: `src/services/supabaseSavedChemicals.ts`

**Step 1: Build each service**

Follow the same pattern as Task 8. For quotes, kits, and actuals where we store complex objects as JSONB, the pattern is:

```typescript
// Example: getQuotes
export async function getQuotes(userId: string): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('contractor_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row.quote_data,
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveQuote(
  data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Quote> {
  const { data: result, error } = await supabase
    .from('quotes')
    .insert({
      contractor_user_id: data.contractorUserId,
      client_id: data.clientId || null,
      quote_data: data,
      status: data.status,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...result.quote_data, id: result.id, createdAt: result.created_at, updatedAt: result.updated_at };
}
```

**Step 2: Commit**

```bash
git add src/services/supabaseQuoteStore.ts src/services/supabaseFinancialsStore.ts src/services/supabaseSavedChemicals.ts
git commit -m "feat: add Supabase services for quotes, financials, and saved chemicals"
```

---

### Task 10: Update all pages to use async Supabase services

**Files:**
- Modify: Every page in `src/pages/` that calls service functions
- Modify: Every component in `src/components/` that calls service functions

**Step 1: Systematic page updates**

For each page, the pattern is:
1. Replace sync imports with async Supabase service imports
2. Wrap data fetching in `useSupabaseQuery` hook or `useEffect` + `useState`
3. Add loading/error states to the UI
4. Ensure mutations (save/update/delete) use `await` and refetch after

Example for `FinancialsList.tsx`:
```typescript
// Old:
const actuals = useMemo(() => getActuals(userId), [userId]);

// New:
const { data: actuals, loading } = useSupabaseQuery(
  () => getActuals(userId),
  [userId],
);
if (loading) return <CircularProgress />;
```

**Step 2: Update every page systematically**

Pages to update (in order of complexity, simplest first):
1. `Home.tsx` — minimal data calls
2. `FinancialsList.tsx` — getActuals, getFinancialsSummary
3. `ActualDetail.tsx` — getActualById
4. `ActualCreate.tsx` — getClients, getJobs, getQuotes, getKits, saveActual
5. `QuoteCreate.tsx` — getClients, getKits, getQuoteConfig, saveQuote
6. `QuoteDetail.tsx` — getQuoteById
7. `JobDetail.tsx` — getJobById, getActualByJobId
8. `FieldDetail.tsx`, `PropertyDetail.tsx`, `ClientDetail.tsx` — nested data
9. `Admin.tsx` — all-user visibility
10. `Database.tsx`, `Search.tsx` — chemical search + database requests

**Step 3: Commit per batch** (2-3 pages per commit)

```bash
git commit -m "feat: migrate Home and FinancialsList to Supabase queries"
git commit -m "feat: migrate ActualCreate and ActualDetail to Supabase queries"
# ... etc
```

---

## Phase 4: File Storage Migration

### Task 11: Create file upload/download service

**Files:**
- Create: `src/services/supabaseStorage.ts`

**Step 1: Build the storage service**

```typescript
import { supabase } from './supabaseClient';

type Bucket = 'spray-recs' | 'field-boundaries' | 'job-attachments';

export async function uploadFile(
  bucket: Bucket,
  userId: string,
  file: File,
  fileName?: string,
): Promise<string> {
  const path = `${userId}/${fileName || file.name}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function getFileUrl(
  bucket: Bucket,
  path: string,
): Promise<string> {
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour expiry
  return data?.signedUrl || '';
}

export async function deleteFile(
  bucket: Bucket,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
```

**Step 2: Update pages that handle file uploads**

- Spray rec import: upload PDF to `spray-recs` after parsing
- Field boundary upload: upload KML/SHP to `field-boundaries`
- Job outcome photos: upload to `job-attachments`

**Step 3: Commit**

```bash
git add src/services/supabaseStorage.ts
git commit -m "feat: add Supabase storage service for file upload/download"
```

---

## Phase 5: New Features

### Task 12: Add database request UI and auto-search

**Files:**
- Create: `src/services/databaseRequestService.ts`
- Modify: `src/pages/Database.tsx` or `src/pages/Search.tsx` — add "request" button
- Modify: `src/pages/Admin.tsx` — add request queue

**Step 1: Build the database request service**

```typescript
import { supabase } from './supabaseClient';
import { searchAPVMAProducts } from './apvmaService';

export interface DatabaseRequest {
  id: string;
  requestedBy: string;
  searchTerm: string;
  requestType: 'chemical' | 'weed' | 'insect' | 'fungus';
  notes: string;
  status: string;
  apvmaData: any;
  labelUrl: string;
  draftEntry: any;
  confidence: string;
  adminNotes: string;
  createdAt: string;
}

export async function submitDatabaseRequest(
  searchTerm: string,
  requestType: 'chemical' | 'weed' | 'insect' | 'fungus',
  notes: string,
): Promise<DatabaseRequest> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Create the request
  const { data: request, error } = await supabase
    .from('database_requests')
    .insert({
      requested_by: user.id,
      search_term: searchTerm,
      request_type: requestType,
      notes,
      status: 'searching',
    })
    .select()
    .single();
  if (error) throw error;

  // 2. Auto-search APVMA if chemical type
  if (requestType === 'chemical') {
    try {
      const products = await searchAPVMAProducts(searchTerm);
      if (products.length > 0) {
        const bestMatch = products[0];
        const labelUrl = `https://portal.apvma.gov.au/pubcris?p_auth=guest&p_p_id=pubcrisportlet_WAR_pubcrisportlet&p_p_lifecycle=1&p_p_state=normal&_pubcrisportlet_WAR_pubcrisportlet_javax.portlet.action=search&_pubcrisportlet_WAR_pubcrisportlet_searchTerm=${encodeURIComponent(searchTerm)}`;

        await supabase
          .from('database_requests')
          .update({
            status: 'ready_for_review',
            apvma_data: bestMatch,
            label_url: labelUrl,
            draft_entry: bestMatch,  // will be enriched by Edge Function later
            confidence: products.length === 1 ? 'high' : 'medium',
          })
          .eq('id', request.id);
      } else {
        await supabase
          .from('database_requests')
          .update({ status: 'ready_for_review', confidence: 'low' })
          .eq('id', request.id);
      }
    } catch {
      await supabase
        .from('database_requests')
        .update({ status: 'ready_for_review', confidence: 'low' })
        .eq('id', request.id);
    }
  } else {
    await supabase
      .from('database_requests')
      .update({ status: 'ready_for_review' })
      .eq('id', request.id);
  }

  return request;
}

// Admin functions
export async function getRequests(status?: string): Promise<DatabaseRequest[]> {
  let query = supabase
    .from('database_requests')
    .select('*, profiles!requested_by(name, email)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function approveRequest(id: string, adminNotes?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase
    .from('database_requests')
    .update({
      status: 'approved',
      admin_notes: adminNotes || '',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function dismissRequest(id: string, adminNotes?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase
    .from('database_requests')
    .update({
      status: 'dismissed',
      admin_notes: adminNotes || '',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);
}
```

**Step 2: Add "Can't find it?" button to search results**

In the database/search page, when results are empty, show:
```tsx
<Button onClick={() => setShowRequestDialog(true)}>
  Can't find what you're looking for? Request it
</Button>
```

With a dialog that has: search term (pre-filled), type dropdown, notes textarea, submit button.

**Step 3: Add admin queue to Admin page**

Add a "Database Requests" section to the admin page showing pending requests with approve/dismiss buttons.

**Step 4: Commit**

```bash
git add src/services/databaseRequestService.ts
git commit -m "feat: add database request service with APVMA auto-search"
```

---

### Task 13: Set up email notifications via Supabase Edge Function

**Files:**
- Create: `supabase/functions/send-notification-email/index.ts`

**Step 1: Set up Resend**

Sign up at https://resend.com (free tier: 3,000 emails/month).
Get an API key. Add it as a Supabase secret:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
```

**Step 2: Create the Edge Function**

```typescript
// supabase/functions/send-notification-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = 'admin@flythefarm.com.au';

serve(async (req) => {
  const { type, searchTerm, requestedBy, requestId } = await req.json();

  const html = `
    <h2>New Database Request</h2>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Search Term:</strong> ${searchTerm}</p>
    <p><strong>Requested By:</strong> ${requestedBy}</p>
    <p><a href="https://your-app.vercel.app/admin?request=${requestId}">Review & Approve</a></p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Fly The Farm <noreply@flythefarm.com.au>',
      to: [ADMIN_EMAIL],
      subject: `New DB Request: ${searchTerm} (${type})`,
      html,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Step 3: Wire up — call Edge Function after creating a request**

In `databaseRequestService.ts`, after inserting the request, invoke:
```typescript
await supabase.functions.invoke('send-notification-email', {
  body: { type: requestType, searchTerm, requestedBy: user.email, requestId: request.id },
});
```

**Step 4: Commit**

```bash
git add supabase/functions/send-notification-email/index.ts
git commit -m "feat: add email notification Edge Function for database requests"
```

---

### Task 14: Set up staging branch workflow

**Files:**
- Modify: Git branching

**Step 1: Create develop branch**

```bash
git checkout -b develop
git push -u origin develop
```

**Step 2: Configure Vercel**

In Vercel project settings:
- Production Branch: `main`
- Preview deployments: enabled (every push to non-main branches gets a preview URL)

The `develop` branch will auto-deploy to a preview URL like `fly-the-farm-dashboard-git-develop-xxx.vercel.app`. Use this as your staging environment.

**Step 3: Set workflow**

Day-to-day development:
```bash
git checkout develop
# make changes
git commit -m "feat: whatever"
git push  # auto-deploys to staging preview URL
```

When ready to go live:
```bash
git checkout main
git merge develop
git push  # auto-deploys to production
```

**Step 4: Commit**

```bash
git commit --allow-empty -m "chore: establish develop branch for staging workflow"
git push
```

---

### Task 15: Data migration tool (admin-only)

**Files:**
- Create: `src/pages/DataMigration.tsx`
- Modify: `src/App.tsx` — add route `/admin/migrate`

**Step 1: Build the migration page**

An admin-only page that:
1. Reads all 12 localStorage keys
2. Shows a count of records per store
3. Has a "Migrate All" button that pushes each record to Supabase
4. Shows progress and results
5. Has a "Clear localStorage" button to clean up after migration

This is a one-time use page — can be removed after all testers have migrated.

**Step 2: Commit**

```bash
git add src/pages/DataMigration.tsx
git commit -m "feat: add admin data migration tool (localStorage → Supabase)"
```

---

### Task 16: Seed admin account

**Step 1: Create admin account**

After deploying, go to the app and register with:
- Email: `admin@flythefarm.com.au`
- Password: (your chosen password)
- Name: Admin

**Step 2: Set admin role**

In Supabase SQL Editor:
```sql
update public.profiles
set role = 'admin'
where email = 'admin@flythefarm.com.au';
```

This only needs to be done once.

---

### Task 17: Build and deploy

**Step 1: Build locally**

```bash
npm run build
```

Fix any TypeScript/lint errors.

**Step 2: Push to develop (staging)**

```bash
git checkout develop
git push
```

Test on staging preview URL.

**Step 3: Merge to main (production)**

```bash
git checkout main
git merge develop
git push
```

Verify Vercel deployment succeeds and Supabase is connected.
