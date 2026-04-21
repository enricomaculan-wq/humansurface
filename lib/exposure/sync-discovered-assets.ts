import { supabaseAdmin } from '@/lib/supabase-admin'

type OrganizationLike = {
  id: string
  name: string
  domain: string
}

type DiscoveredPersonLike = {
  fullName: string | null
  roleTitle: string
  department?: string | null
  email?: string | null
  isKeyPerson?: boolean
}

type WebsiteSignalLike = {
  url: string
  title?: string | null
  emails?: string[]
}

type SyncDiscoveredAssetsInput = {
  organization: OrganizationLike
  classifiedPeople?: DiscoveredPersonLike[]
  extractedSignals?: WebsiteSignalLike[]
  externalPeople?: DiscoveredPersonLike[]
  brandNames?: string[]
}

type AssetInsertRow = {
  organization_id: string
  asset_type: string
  value: string
  normalized_value: string
  display_name: string | null
  criticality: 'low' | 'medium' | 'high' | 'critical'
  verification_status: string
  source: string
  is_active: boolean
  is_primary: boolean
  metadata: Record<string, unknown>
  tags: string[]
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function normalizeLower(value: string | null | undefined) {
  return normalizeText(value).toLowerCase()
}

function normalizeEmail(email: string | null | undefined) {
  const trimmed = normalizeText(email)
  return trimmed ? trimmed.toLowerCase() : ''
}

function normalizeDomain(domain: string | null | undefined) {
  const trimmed = normalizeText(domain).toLowerCase()
  if (!trimmed) return ''

  return trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

function normalizeBrand(value: string | null | undefined) {
  return normalizeText(value).toLowerCase()
}

function normalizePersonValue(fullName: string | null | undefined, roleTitle: string | null | undefined) {
  return `${normalizeLower(fullName)}|${normalizeLower(roleTitle)}`
}

function normalizePhone(value: string | null | undefined) {
  return normalizeText(value).replace(/\s+/g, '')
}

function uniqueStrings(values: Array<string | null | undefined>) {
  const set = new Set<string>()

  for (const value of values) {
    const trimmed = normalizeText(value)
    if (trimmed) set.add(trimmed)
  }

  return [...set]
}

function brandVariants(input: string) {
  const trimmed = normalizeText(input)
  if (!trimmed) return []

  const compact = trimmed.replace(/\s+/g, '')
  const noPunctuation = trimmed.replace(/[^\p{L}\p{N}\s-]/gu, '').trim()

  return uniqueStrings([trimmed, compact, noPunctuation])
}

function extractEmailsFromSignals(signals: WebsiteSignalLike[]) {
  const emails = new Set<string>()

  for (const signal of signals) {
    for (const email of signal.emails ?? []) {
      const normalized = normalizeEmail(email)
      if (normalized) emails.add(normalized)
    }
  }

  return [...emails]
}

function extractDomainsFromSignals(signals: WebsiteSignalLike[]) {
  const domains = new Set<string>()

  for (const signal of signals) {
    const normalized = normalizeDomain(signal.url)
    if (normalized) {
      domains.add(normalized)
    }
  }

  return [...domains]
}

function emailCriticality(email: string) {
  const normalized = email.toLowerCase()

  if (
    normalized.startsWith('ceo@') ||
    normalized.startsWith('cfo@') ||
    normalized.startsWith('finance@') ||
    normalized.startsWith('admin@') ||
    normalized.startsWith('support@')
  ) {
    return 'critical' as const
  }

  if (
    normalized.startsWith('hr@') ||
    normalized.startsWith('careers@') ||
    normalized.startsWith('jobs@') ||
    normalized.startsWith('info@') ||
    normalized.startsWith('sales@')
  ) {
    return 'high' as const
  }

  return 'medium' as const
}

function personCriticality(person: DiscoveredPersonLike) {
  const role = normalizeLower(person.roleTitle)

  if (
    person.isKeyPerson ||
    /ceo|cfo|coo|cto|founder|owner|president|director|managing director|board/i.test(role)
  ) {
    return 'critical' as const
  }

  if (/finance|hr|human resources|payroll|procurement|legal|operations/i.test(role)) {
    return 'high' as const
  }

  return 'medium' as const
}

function domainCriticality(domain: string, primaryDomain: string) {
  const normalized = normalizeDomain(domain)
  const primary = normalizeDomain(primaryDomain)

  if (normalized && normalized === primary) return 'critical' as const
  return 'high' as const
}

function buildAssetRows(input: SyncDiscoveredAssetsInput) {
  const rows = new Map<string, AssetInsertRow>()
  const organizationDomain = normalizeDomain(input.organization.domain)
  const signals = input.extractedSignals ?? []
  const classifiedPeople = input.classifiedPeople ?? []
  const externalPeople = input.externalPeople ?? []

  const allPeople = [...classifiedPeople, ...externalPeople]

  const addRow = (row: AssetInsertRow) => {
    const key = `${row.asset_type}:${row.normalized_value}`

    const existing = rows.get(key)
    if (!existing) {
      rows.set(key, row)
      return
    }

    const rank = (value: string) => {
      if (value === 'critical') return 4
      if (value === 'high') return 3
      if (value === 'medium') return 2
      return 1
    }

    rows.set(key, {
      ...existing,
      display_name: existing.display_name ?? row.display_name,
      is_primary: existing.is_primary || row.is_primary,
      criticality:
        rank(row.criticality) > rank(existing.criticality)
          ? row.criticality
          : existing.criticality,
      metadata: {
        ...existing.metadata,
        ...row.metadata,
      },
      tags: uniqueStrings([...existing.tags, ...row.tags]),
    })
  }

  if (organizationDomain) {
    addRow({
      organization_id: input.organization.id,
      asset_type: 'domain',
      value: organizationDomain,
      normalized_value: organizationDomain,
      display_name: input.organization.domain,
      criticality: 'critical',
      verification_status: 'verified',
      source: 'website_discovery',
      is_active: true,
      is_primary: true,
      metadata: {
        root_domain: organizationDomain,
        discovered_from: 'organization',
      },
      tags: ['website', 'primary-domain'],
    })
  }

  for (const domain of extractDomainsFromSignals(signals)) {
    addRow({
      organization_id: input.organization.id,
      asset_type: 'domain',
      value: domain,
      normalized_value: normalizeDomain(domain),
      display_name: domain,
      criticality: domainCriticality(domain, input.organization.domain),
      verification_status: 'verified',
      source: 'website_discovery',
      is_active: true,
      is_primary: normalizeDomain(domain) === organizationDomain,
      metadata: {
        root_domain: normalizeDomain(domain),
        discovered_from: 'signals',
      },
      tags: ['website'],
    })
  }

  for (const email of extractEmailsFromSignals(signals)) {
    const domain = email.includes('@') ? email.split('@')[1] : null

    addRow({
      organization_id: input.organization.id,
      asset_type: 'email',
      value: email,
      normalized_value: email,
      display_name: email,
      criticality: emailCriticality(email),
      verification_status: 'verified',
      source: 'website_discovery',
      is_active: true,
      is_primary: false,
      metadata: {
        domain,
        discovered_from: 'signals',
      },
      tags: ['website', 'email'],
    })
  }

  for (const person of allPeople) {
    const normalizedPersonValue = normalizePersonValue(person.fullName, person.roleTitle)
    if (!normalizedPersonValue) continue

    addRow({
      organization_id: input.organization.id,
      asset_type: 'person',
      value: normalizedPersonValue,
      normalized_value: normalizedPersonValue,
      display_name:
        normalizeText(person.fullName) || normalizeText(person.roleTitle) || null,
      criticality: personCriticality(person),
      verification_status: 'verified',
      source: 'website_discovery',
      is_active: true,
      is_primary: false,
      metadata: {
        full_name: person.fullName,
        role_title: person.roleTitle,
        department: person.department ?? null,
        email: person.email ?? null,
        is_key_person: person.isKeyPerson ?? false,
      },
      tags: ['person'],
    })

    const normalizedEmail = normalizeEmail(person.email)
    if (normalizedEmail) {
      const emailDomain = normalizedEmail.includes('@')
        ? normalizedEmail.split('@')[1]
        : null

      addRow({
        organization_id: input.organization.id,
        asset_type: 'email',
        value: normalizedEmail,
        normalized_value: normalizedEmail,
        display_name: person.fullName
          ? `${person.fullName} <${normalizedEmail}>`
          : normalizedEmail,
        criticality: personCriticality(person),
        verification_status: 'verified',
        source: 'website_discovery',
        is_active: true,
        is_primary: false,
        metadata: {
          domain: emailDomain,
          linked_person_name: person.fullName,
          linked_role_title: person.roleTitle,
          discovered_from: 'people',
        },
        tags: ['person-email'],
      })
    }
  }

  const organizationBrands = uniqueStrings([
    input.organization.name,
    ...(input.brandNames ?? []),
  ])

  for (const brand of organizationBrands.flatMap(brandVariants)) {
    const normalizedBrand = normalizeBrand(brand)
    if (!normalizedBrand) continue

    addRow({
      organization_id: input.organization.id,
      asset_type: 'brand',
      value: brand,
      normalized_value: normalizedBrand,
      display_name: brand,
      criticality: 'high',
      verification_status: 'verified',
      source: 'website_discovery',
      is_active: true,
      is_primary: normalizeBrand(brand) === normalizeBrand(input.organization.name),
      metadata: {
        brand_variant: normalizedBrand,
        discovered_from: 'organization',
      },
      tags: ['brand'],
    })
  }

  return [...rows.values()]
}

export async function syncDiscoveredAssets(input: SyncDiscoveredAssetsInput) {
  const rows = buildAssetRows(input)

  let inserted = 0
  let updated = 0

  for (const row of rows) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('monitored_assets')
      .select('id')
      .eq('organization_id', row.organization_id)
      .eq('asset_type', row.asset_type)
      .eq('normalized_value', row.normalized_value)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message || 'Unable to read monitored assets.')
    }

    if (existing?.id) {
      const { error: updateError } = await supabaseAdmin
        .from('monitored_assets')
        .update({
          value: row.value,
          display_name: row.display_name,
          criticality: row.criticality,
          verification_status: row.verification_status,
          source: row.source,
          is_active: row.is_active,
          is_primary: row.is_primary,
          metadata: row.metadata,
          tags: row.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        throw new Error(updateError.message || 'Unable to update monitored asset.')
      }

      updated += 1
      continue
    }

    const { error: insertError } = await supabaseAdmin
      .from('monitored_assets')
      .insert(row)

    if (insertError) {
      throw new Error(insertError.message || 'Unable to insert monitored asset.')
    }

    inserted += 1
  }

  return {
    total: rows.length,
    inserted,
    updated,
  }
}