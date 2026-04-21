begin;

create extension if not exists pgcrypto;

-- =========================================================
-- Utility
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- 1) Extend existing findings table safely
-- Only additive, nullable/defaulted columns
-- =========================================================

alter table public.findings
  add column if not exists module text,
  add column if not exists finding_status text,
  add column if not exists first_seen_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists fingerprint text,
  add column if not exists evidence_redacted text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists updated_at timestamptz default now();

-- Safe backfill for new columns
update public.findings
set module = coalesce(module, 'core')
where module is null;

update public.findings
set finding_status = coalesce(finding_status, 'new')
where finding_status is null;

update public.findings
set first_seen_at = coalesce(first_seen_at, created_at)
where first_seen_at is null;

update public.findings
set last_seen_at = coalesce(last_seen_at, created_at)
where last_seen_at is null;

update public.findings
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

-- Add constraints only if not already added
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'findings_module_check'
  ) then
    alter table public.findings
      add constraint findings_module_check
      check (module in ('core', 'darkweb'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'findings_finding_status_check'
  ) then
    alter table public.findings
      add constraint findings_finding_status_check
      check (finding_status in ('new', 'reviewed', 'in_progress', 'resolved', 'suppressed'));
  end if;
end $$;

create index if not exists idx_findings_module
  on public.findings (module);

create index if not exists idx_findings_finding_status
  on public.findings (finding_status);

create index if not exists idx_findings_first_seen_at
  on public.findings (first_seen_at desc);

create index if not exists idx_findings_last_seen_at
  on public.findings (last_seen_at desc);

create index if not exists idx_findings_fingerprint
  on public.findings (fingerprint);

create index if not exists idx_findings_metadata_gin
  on public.findings
  using gin (metadata);

drop trigger if exists trg_findings_set_updated_at on public.findings;
create trigger trg_findings_set_updated_at
before update on public.findings
for each row
execute function public.set_updated_at();

-- =========================================================
-- 2) Monitored assets
-- New table, no disruption to existing flows
-- =========================================================

create table if not exists public.monitored_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,

  asset_type text not null check (
    asset_type in ('domain', 'email', 'person', 'username', 'phone', 'brand')
  ),

  value text not null,
  normalized_value text not null,
  display_name text,

  criticality text not null default 'medium' check (
    criticality in ('low', 'medium', 'high', 'critical')
  ),

  verification_status text not null default 'unverified' check (
    verification_status in ('unverified', 'pending', 'verified', 'rejected')
  ),

  source text not null default 'manual' check (
    source in ('manual', 'import', 'derived', 'system')
  ),

  is_active boolean not null default true,
  is_primary boolean not null default false,

  metadata jsonb not null default '{}'::jsonb,
  tags jsonb not null default '[]'::jsonb,

  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_monitored_assets_org_type_value
  on public.monitored_assets (organization_id, asset_type, normalized_value);

create index if not exists idx_monitored_assets_org
  on public.monitored_assets (organization_id);

create index if not exists idx_monitored_assets_person
  on public.monitored_assets (person_id);

create index if not exists idx_monitored_assets_type
  on public.monitored_assets (asset_type);

create index if not exists idx_monitored_assets_active
  on public.monitored_assets (is_active);

create index if not exists idx_monitored_assets_criticality
  on public.monitored_assets (criticality);

create index if not exists idx_monitored_assets_metadata_gin
  on public.monitored_assets
  using gin (metadata);

drop trigger if exists trg_monitored_assets_set_updated_at on public.monitored_assets;
create trigger trg_monitored_assets_set_updated_at
before update on public.monitored_assets
for each row
execute function public.set_updated_at();

-- =========================================================
-- 3) Finding assets
-- Join between existing findings and new monitored assets
-- =========================================================

create table if not exists public.finding_assets (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings(id) on delete cascade,
  asset_id uuid not null references public.monitored_assets(id) on delete cascade,
  relation_type text not null default 'matched' check (
    relation_type in ('matched', 'related', 'affected', 'mentioned')
  ),
  created_at timestamptz not null default now(),
  unique (finding_id, asset_id, relation_type)
);

create index if not exists idx_finding_assets_finding
  on public.finding_assets (finding_id);

create index if not exists idx_finding_assets_asset
  on public.finding_assets (asset_id);

-- =========================================================
-- 4) Finding evidence
-- Redacted evidence only
-- =========================================================

create table if not exists public.finding_evidence (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings(id) on delete cascade,

  source_type text not null check (
    source_type in (
      'breach_dataset',
      'combo_list',
      'stealer_log',
      'forum_mention',
      'marketplace_mention',
      'other'
    )
  ),

  source_name text,
  source_reference text,

  snippet_redacted text,
  matched_fields jsonb not null default '[]'::jsonb,

  observed_at timestamptz,
  collected_at timestamptz not null default now(),

  confidence numeric(5,2) default 0.50 check (
    confidence is null or (confidence >= 0 and confidence <= 1)
  ),

  sensitivity_level text not null default 'medium' check (
    sensitivity_level in ('low', 'medium', 'high', 'critical')
  ),

  raw_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_finding_evidence_finding
  on public.finding_evidence (finding_id);

create index if not exists idx_finding_evidence_source_type
  on public.finding_evidence (source_type);

create index if not exists idx_finding_evidence_observed_at
  on public.finding_evidence (observed_at desc);

create index if not exists idx_finding_evidence_matched_fields_gin
  on public.finding_evidence
  using gin (matched_fields);

-- =========================================================
-- 5) Dark web alerts
-- Separate table to avoid colliding with existing app logic
-- =========================================================

create table if not exists public.darkweb_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete cascade,
  finding_id uuid references public.findings(id) on delete cascade,

  alert_type text not null check (
    alert_type in (
      'new_critical_finding',
      'new_high_finding',
      'stealer_detected',
      'exposure_spike',
      'executive_asset_match'
    )
  ),

  channel text not null check (
    channel in ('dashboard', 'email')
  ),

  status text not null default 'pending' check (
    status in ('pending', 'sent', 'failed', 'dismissed')
  ),

  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_darkweb_alerts_org
  on public.darkweb_alerts (organization_id);

create index if not exists idx_darkweb_alerts_assessment
  on public.darkweb_alerts (assessment_id);

create index if not exists idx_darkweb_alerts_finding
  on public.darkweb_alerts (finding_id);

create index if not exists idx_darkweb_alerts_status
  on public.darkweb_alerts (status);

create index if not exists idx_darkweb_alerts_created_at
  on public.darkweb_alerts (created_at desc);

-- =========================================================
-- 6) Risk snapshots for dark web trends
-- Separate from current scores table, safer for rollout
-- =========================================================

create table if not exists public.risk_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete set null,

  public_exposure_score integer not null default 0 check (
    public_exposure_score >= 0 and public_exposure_score <= 100
  ),
  darkweb_exposure_score integer not null default 0 check (
    darkweb_exposure_score >= 0 and darkweb_exposure_score <= 100
  ),
  overall_exposure_score integer not null default 0 check (
    overall_exposure_score >= 0 and overall_exposure_score <= 100
  ),

  total_findings integer not null default 0 check (total_findings >= 0),
  critical_findings integer not null default 0 check (critical_findings >= 0),
  high_findings integer not null default 0 check (high_findings >= 0),
  medium_findings integer not null default 0 check (medium_findings >= 0),
  low_findings integer not null default 0 check (low_findings >= 0),

  snapshot_date date not null default current_date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  unique (organization_id, snapshot_date)
);

create index if not exists idx_risk_snapshots_org_date
  on public.risk_snapshots (organization_id, snapshot_date desc);

create index if not exists idx_risk_snapshots_assessment
  on public.risk_snapshots (assessment_id);

-- =========================================================
-- 7) Helper trigger: touch asset when linked to a finding
-- =========================================================

create or replace function public.touch_monitored_asset_last_checked()
returns trigger
language plpgsql
as $$
begin
  update public.monitored_assets
  set last_checked_at = now(),
      updated_at = now()
  where id = new.asset_id;

  return new;
end;
$$;

drop trigger if exists trg_touch_monitored_asset_last_checked on public.finding_assets;
create trigger trg_touch_monitored_asset_last_checked
after insert on public.finding_assets
for each row
execute function public.touch_monitored_asset_last_checked();

-- =========================================================
-- 8) Helper trigger: optional evidence counter in findings metadata
-- Safe: does not require schema changes beyond metadata column
-- =========================================================

create or replace function public.sync_finding_evidence_metadata()
returns trigger
language plpgsql
as $$
declare
  target_finding_id uuid;
  evidence_total integer;
begin
  target_finding_id := coalesce(new.finding_id, old.finding_id);

  select count(*)
    into evidence_total
  from public.finding_evidence
  where finding_id = target_finding_id;

  update public.findings
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('evidence_count', evidence_total),
      updated_at = now()
  where id = target_finding_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_finding_evidence_metadata_insert on public.finding_evidence;
create trigger trg_sync_finding_evidence_metadata_insert
after insert on public.finding_evidence
for each row
execute function public.sync_finding_evidence_metadata();

drop trigger if exists trg_sync_finding_evidence_metadata_delete on public.finding_evidence;
create trigger trg_sync_finding_evidence_metadata_delete
after delete on public.finding_evidence
for each row
execute function public.sync_finding_evidence_metadata();

commit;