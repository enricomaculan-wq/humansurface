---
name: darkweb-architecture
description: Design and evolve the HumanSurface dark web module architecture, data model, workflow boundaries, scoring model, and integration points with the existing assessment system.
---

Use this skill when the task involves planning or restructuring the HumanSurface dark web module before writing code.

Purpose:
Design a serious dark web extension for HumanSurface without duplicating the existing public exposure assessment logic.

Product context:
HumanSurface already analyzes public exposure: people, roles, emails, domains, business context, phishing and fraud risk.
The dark web module must extend this logic, not replace it.

Core workflow:
1. Extract seeds from public assessment data and public web findings.
2. Enrich those seeds with targeted public-web correlation.
3. Use those seeds for targeted dark web lookup.
4. Normalize results into clear, business-facing dark web findings.
5. Produce dark web scoring and admin-visible summaries.

The module should support at least these seed types:
- domain
- corporate emails
- email patterns
- people names
- key roles
- company / brand names
- subdomains
- public document names
- distinctive strings useful for correlation

The module should support at least these finding categories:
- credential exposure
- brand/domain mention
- employee exposure
- sensitive document exposure
- technical exposure correlation
- fraud-enabling exposure

Architecture rules:
- Reuse existing dark-web code where possible.
- Do not duplicate connectors or scan pipelines if a usable base already exists.
- Prefer modular orchestration over one large route or service.
- Keep the output business-facing, not noisy threat-intel output.
- Avoid broad crawling or massive unfiltered collection.
- Keep the module explainable and premium.

Expected architectural outputs:
- data model proposal
- workflow diagram in prose
- ownership of each module/service
- scoring inputs and weighting logic
- admin integration points
- TODO list for later monitoring phase

When using this skill:
- first inspect the current codebase for all existing dark-web related files
- identify what can be reused, removed, or consolidated
- propose a minimal MVP architecture before implementing
- prefer small, reversible steps