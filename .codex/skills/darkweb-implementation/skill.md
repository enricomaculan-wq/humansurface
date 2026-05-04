---
name: darkweb-implementation
description: Implement the HumanSurface dark web MVP: Supabase schema, TypeScript types, orchestration services, normalization, scoring, and admin integration.
---

Use this skill when the task requires writing code for the HumanSurface dark web module.

Implementation goals:
Build the first serious MVP of the dark web module as an extension of HumanSurface.

Required implementation areas:
- Supabase schema
- TypeScript domain types
- server-side orchestration
- raw result normalization
- findings persistence
- dark web scoring
- admin assessment integration

Preferred tables:
- darkweb_search_runs
- darkweb_seeds
- darkweb_raw_results
- darkweb_findings
- darkweb_score_snapshots

Recommended common fields:
- id
- assessment_id
- organization_id
- status
- created_at
- updated_at

Recommended normalized finding fields:
- id
- assessment_id
- organization_id
- source_type
- source_name
- matched_term
- matched_entity_type
- confidence
- severity
- title
- summary
- evidence_snippet
- raw_reference
- requires_review
- status
- created_at

Scoring requirements:
Produce a dark web score from 0 to 100 and a risk level:
- low
- medium
- high
- critical

Score should be driven by:
- finding category
- severity
- confidence
- repetition / correlation
- credential exposure weight
- business fraud relevance

Integration requirements:
- keep current public assessment flow intact
- do not break admin routes or existing dark-web pages
- add admin-visible dark web summary section
- do not expose unfinished output to the client area unless explicitly requested

Coding rules:
- match existing project style and naming conventions
- keep functions small and typed
- prefer additive changes over destructive rewrites
- avoid introducing heavy dependencies
- keep fallbacks safe when data is missing

Execution pattern:
1. inspect current implementation
2. implement schema/types first
3. implement services next
4. integrate UI last
5. keep each change build-safe