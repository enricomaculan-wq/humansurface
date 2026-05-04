begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.monitored_assets
  drop constraint if exists monitored_assets_asset_type_check;

alter table public.monitored_assets
  add constraint monitored_assets_asset_type_check
  check (
    asset_type in (
      'domain',
      'email',
      'email_pattern',
      'person',
      'key_role',
      'username',
      'phone',
      'brand',
      'subdomain',
      'document_name',
      'distinctive_string'
    )
  );

alter table public.monitored_assets
  drop constraint if exists monitored_assets_source_check;

alter table public.monitored_assets
  add constraint monitored_assets_source_check
  check (
    source in (
      'manual',
      'import',
      'derived',
      'system',
      'website_discovery',
      'external_discovery',
      'assessment_seed'
    )
  );

create table if not exists public.darkweb_search_runs (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'queued' check (
    status in ('queued', 'running', 'completed', 'failed', 'canceled')
  ),
  trigger_source text not null default 'manual' check (
    trigger_source in ('manual', 'assessment', 'system')
  ),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_darkweb_search_runs_org
  on public.darkweb_search_runs (organization_id);

create index if not exists idx_darkweb_search_runs_assessment
  on public.darkweb_search_runs (assessment_id);

create index if not exists idx_darkweb_search_runs_status
  on public.darkweb_search_runs (status);

create index if not exists idx_darkweb_search_runs_created_at
  on public.darkweb_search_runs (created_at desc);

drop trigger if exists trg_darkweb_search_runs_set_updated_at on public.darkweb_search_runs;
create trigger trg_darkweb_search_runs_set_updated_at
before update on public.darkweb_search_runs
for each row
execute function public.set_updated_at();

create table if not exists public.darkweb_seeds (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.darkweb_search_runs(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  seed_type text not null check (
    seed_type in (
      'domain',
      'email',
      'email_pattern',
      'person',
      'key_role',
      'brand',
      'subdomain',
      'document_name',
      'distinctive_string',
      'username',
      'phone'
    )
  ),
  term text not null,
  normalized_term text not null,
  source text not null default 'assessment' check (
    source in ('assessment', 'monitored_asset', 'manual', 'system')
  ),
  confidence numeric(5,2) not null default 0.70 check (
    confidence >= 0 and confidence <= 1
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_darkweb_seeds_run
  on public.darkweb_seeds (run_id);

create index if not exists idx_darkweb_seeds_org
  on public.darkweb_seeds (organization_id);

create index if not exists idx_darkweb_seeds_assessment
  on public.darkweb_seeds (assessment_id);

create index if not exists idx_darkweb_seeds_type
  on public.darkweb_seeds (seed_type);

create index if not exists idx_darkweb_seeds_normalized
  on public.darkweb_seeds (organization_id, seed_type, normalized_term);

drop trigger if exists trg_darkweb_seeds_set_updated_at on public.darkweb_seeds;
create trigger trg_darkweb_seeds_set_updated_at
before update on public.darkweb_seeds
for each row
execute function public.set_updated_at();

create table if not exists public.darkweb_raw_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.darkweb_search_runs(id) on delete set null,
  seed_id uuid references public.darkweb_seeds(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_type text not null,
  source_name text,
  raw_reference text,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_text text,
  raw_hash text,
  status text not null default 'new' check (
    status in ('new', 'normalized', 'matched', 'ignored', 'failed')
  ),
  error_message text,
  observed_at timestamptz,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_darkweb_raw_results_run
  on public.darkweb_raw_results (run_id);

create index if not exists idx_darkweb_raw_results_seed
  on public.darkweb_raw_results (seed_id);

create index if not exists idx_darkweb_raw_results_org
  on public.darkweb_raw_results (organization_id);

create index if not exists idx_darkweb_raw_results_assessment
  on public.darkweb_raw_results (assessment_id);

create index if not exists idx_darkweb_raw_results_status
  on public.darkweb_raw_results (status);

create unique index if not exists uq_darkweb_raw_results_hash
  on public.darkweb_raw_results (organization_id, raw_hash)
  where raw_hash is not null;

drop trigger if exists trg_darkweb_raw_results_set_updated_at on public.darkweb_raw_results;
create trigger trg_darkweb_raw_results_set_updated_at
before update on public.darkweb_raw_results
for each row
execute function public.set_updated_at();

create table if not exists public.darkweb_findings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.darkweb_search_runs(id) on delete set null,
  raw_result_id uuid references public.darkweb_raw_results(id) on delete set null,
  finding_id uuid references public.findings(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_type text not null,
  source_name text,
  category text not null check (
    category in (
      'credential_exposure',
      'brand_domain_mention',
      'employee_exposure',
      'sensitive_document_exposure',
      'technical_exposure_correlation',
      'fraud_enabling_exposure'
    )
  ),
  matched_term text not null,
  matched_entity_type text not null check (
    matched_entity_type in (
      'domain',
      'email',
      'email_pattern',
      'person',
      'key_role',
      'brand',
      'subdomain',
      'document_name',
      'distinctive_string',
      'username',
      'phone'
    )
  ),
  confidence numeric(5,2) not null default 0.70 check (
    confidence >= 0 and confidence <= 1
  ),
  severity text not null default 'medium' check (
    severity in ('low', 'medium', 'high', 'critical')
  ),
  title text not null,
  summary text,
  evidence_snippet text,
  raw_reference text,
  requires_review boolean not null default true,
  status text not null default 'new' check (
    status in ('new', 'reviewed', 'suppressed', 'resolved')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_darkweb_findings_run
  on public.darkweb_findings (run_id);

create index if not exists idx_darkweb_findings_raw_result
  on public.darkweb_findings (raw_result_id);

create index if not exists idx_darkweb_findings_finding
  on public.darkweb_findings (finding_id);

create index if not exists idx_darkweb_findings_org
  on public.darkweb_findings (organization_id);

create index if not exists idx_darkweb_findings_assessment
  on public.darkweb_findings (assessment_id);

create index if not exists idx_darkweb_findings_status
  on public.darkweb_findings (status);

create index if not exists idx_darkweb_findings_severity
  on public.darkweb_findings (severity);

create index if not exists idx_darkweb_findings_category
  on public.darkweb_findings (category);

drop trigger if exists trg_darkweb_findings_set_updated_at on public.darkweb_findings;
create trigger trg_darkweb_findings_set_updated_at
before update on public.darkweb_findings
for each row
execute function public.set_updated_at();

create table if not exists public.darkweb_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.darkweb_search_runs(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  score integer not null default 0 check (score >= 0 and score <= 100),
  risk_level text not null default 'low' check (
    risk_level in ('low', 'medium', 'high', 'critical')
  ),
  total_findings integer not null default 0 check (total_findings >= 0),
  critical_findings integer not null default 0 check (critical_findings >= 0),
  high_findings integer not null default 0 check (high_findings >= 0),
  credential_findings integer not null default 0 check (credential_findings >= 0),
  fraud_relevant_findings integer not null default 0 check (fraud_relevant_findings >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_darkweb_score_snapshots_run
  on public.darkweb_score_snapshots (run_id);

create index if not exists idx_darkweb_score_snapshots_org
  on public.darkweb_score_snapshots (organization_id);

create index if not exists idx_darkweb_score_snapshots_assessment
  on public.darkweb_score_snapshots (assessment_id);

create index if not exists idx_darkweb_score_snapshots_created_at
  on public.darkweb_score_snapshots (created_at desc);

commit;
