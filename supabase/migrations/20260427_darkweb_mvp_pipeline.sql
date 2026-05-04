begin;

alter table public.darkweb_findings
  add column if not exists fingerprint text;

create unique index if not exists uq_darkweb_findings_org_fingerprint
  on public.darkweb_findings (organization_id, fingerprint)
  where fingerprint is not null;

create index if not exists idx_darkweb_findings_fingerprint
  on public.darkweb_findings (fingerprint);

commit;
