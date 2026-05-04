begin;

grant usage on schema public to service_role;

grant select, insert, update, delete
  on table public.darkweb_search_runs,
           public.darkweb_seeds,
           public.darkweb_raw_results,
           public.darkweb_findings,
           public.darkweb_score_snapshots
  to service_role;

commit;
