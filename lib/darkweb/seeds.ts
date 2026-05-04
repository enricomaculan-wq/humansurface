import { normalizeDarkwebTerm } from './normalize'
import type { DarkwebSeedInput, DarkwebSeedType, JsonRecord } from './types'

type MonitoredAssetSeedRow = {
  id?: string
  asset_type: string
  value: string
  normalized_value: string
  display_name: string | null
  criticality: string
  is_active: boolean
  is_primary?: boolean | null
  metadata?: JsonRecord | null
  tags?: unknown
}

const assetTypeToSeedType: Partial<Record<string, DarkwebSeedType>> = {
  domain: 'domain',
  email: 'email',
  email_pattern: 'email_pattern',
  person: 'person',
  key_role: 'key_role',
  username: 'username',
  phone: 'phone',
  brand: 'brand',
  subdomain: 'subdomain',
  document_name: 'document_name',
  distinctive_string: 'distinctive_string',
}

function confidenceForAsset(asset: MonitoredAssetSeedRow) {
  if (asset.criticality === 'critical') return 0.95
  if (asset.criticality === 'high') return 0.85
  if (asset.criticality === 'medium') return 0.7
  return 0.55
}

function emailDomain(email: string) {
  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf('@')
  if (at <= 0) return null
  return normalized.slice(at + 1) || null
}

function maybeKeyRoleSeed(asset: MonitoredAssetSeedRow): DarkwebSeedInput | null {
  if (asset.asset_type !== 'person') return null

  const metadata = asset.metadata ?? {}
  const roleTitle =
    typeof metadata.role_title === 'string' ? metadata.role_title.trim() : ''
  const isKeyPerson = metadata.is_key_person === true
  const isSensitiveRole =
    /ceo|cfo|coo|cto|founder|owner|president|director|finance|payroll|hr|legal/i.test(
      roleTitle,
    )

  if (!roleTitle || (!isKeyPerson && !isSensitiveRole)) return null

  return {
    seedType: 'key_role',
    term: roleTitle,
    normalizedTerm: normalizeDarkwebTerm('key_role', roleTitle),
    source: 'monitored_asset',
    confidence: confidenceForAsset(asset),
    metadata: {
      monitored_asset_id: asset.id ?? null,
      source_asset_type: asset.asset_type,
      criticality: asset.criticality,
    },
  }
}

function maybeEmailPatternSeed(asset: MonitoredAssetSeedRow): DarkwebSeedInput | null {
  if (asset.asset_type !== 'email') return null

  const domain = emailDomain(asset.normalized_value || asset.value)
  if (!domain) return null

  const term = `*@${domain}`

  return {
    seedType: 'email_pattern',
    term,
    normalizedTerm: normalizeDarkwebTerm('email_pattern', term),
    source: 'monitored_asset',
    confidence: Math.max(0.6, confidenceForAsset(asset) - 0.15),
    metadata: {
      monitored_asset_id: asset.id ?? null,
      source_asset_type: asset.asset_type,
      derived_from: asset.normalized_value || asset.value,
    },
  }
}

export function buildDarkwebSeedsFromMonitoredAssets(assets: MonitoredAssetSeedRow[]) {
  const seeds = new Map<string, DarkwebSeedInput>()

  const addSeed = (seed: DarkwebSeedInput | null) => {
    if (!seed) return

    const normalizedTerm =
      seed.normalizedTerm ?? normalizeDarkwebTerm(seed.seedType, seed.term)

    if (!normalizedTerm) return

    const key = `${seed.seedType}:${normalizedTerm}`
    const existing = seeds.get(key)

    if (!existing || (seed.confidence ?? 0) > (existing.confidence ?? 0)) {
      seeds.set(key, {
        ...seed,
        normalizedTerm,
      })
    }
  }

  for (const asset of assets) {
    if (!asset.is_active) continue

    const seedType = assetTypeToSeedType[asset.asset_type]
    if (!seedType) continue

    const term = asset.display_name || asset.normalized_value || asset.value

    addSeed({
      seedType,
      term,
      normalizedTerm: normalizeDarkwebTerm(seedType, asset.normalized_value || term),
      source: 'monitored_asset',
      confidence: confidenceForAsset(asset),
      metadata: {
        monitored_asset_id: asset.id ?? null,
        source_asset_type: asset.asset_type,
        criticality: asset.criticality,
        is_primary: asset.is_primary ?? false,
      },
    })

    addSeed(maybeKeyRoleSeed(asset))
    addSeed(maybeEmailPatternSeed(asset))
  }

  return [...seeds.values()]
}
