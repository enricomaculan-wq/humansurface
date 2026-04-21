'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireOwnedMonitoredAsset } from '@/lib/darkweb/ownership'

export type UpdateAssetFormState = {
  error: string | null
}

function normalizeAssetValue(assetType: string, value: string) {
  const trimmed = value.trim()

  if (
    assetType === 'email' ||
    assetType === 'domain' ||
    assetType === 'brand' ||
    assetType === 'username'
  ) {
    return trimmed.toLowerCase()
  }

  if (assetType === 'phone') {
    return trimmed.replace(/\s+/g, '')
  }

  return trimmed
}

function autoCriticality(assetType: string, value: string, selected: string) {
  if (selected !== 'medium') return selected

  const normalized = value.trim().toLowerCase()

  if (assetType === 'email') {
    if (
      normalized.startsWith('admin@') ||
      normalized.startsWith('finance@') ||
      normalized.startsWith('ceo@') ||
      normalized.startsWith('support@')
    ) {
      return 'critical'
    }
  }

  return selected
}

export async function updateMonitoredAssetAction(
  assetId: string,
  _prevState: UpdateAssetFormState,
  formData: FormData
): Promise<UpdateAssetFormState> {
  try {
    const { asset, context } = await requireOwnedMonitoredAsset(assetId)

    const assetType = String(formData.get('asset_type') ?? '').trim()
    const value = String(formData.get('value') ?? '').trim()
    const displayName = String(formData.get('display_name') ?? '').trim()
    const inputCriticality = String(formData.get('criticality') ?? 'medium').trim()
    const isPrimary = formData.get('is_primary') === 'on'
    const isActive = formData.get('is_active') === 'on'

    const allowedTypes = ['domain', 'email', 'brand', 'person', 'username', 'phone']
    const allowedCriticalities = ['low', 'medium', 'high', 'critical']

    if (!assetType) return { error: 'Asset type is required.' }
    if (!value) return { error: 'Asset value is required.' }
    if (!allowedTypes.includes(assetType)) return { error: 'Invalid asset type.' }
    if (!allowedCriticalities.includes(inputCriticality)) {
      return { error: 'Invalid criticality.' }
    }

    if (assetType === 'email' && !value.includes('@')) {
      return { error: 'Please enter a valid email asset.' }
    }

    const normalizedValue = normalizeAssetValue(assetType, value)
    const criticality = autoCriticality(assetType, value, inputCriticality)

    const metadata =
      asset.metadata && typeof asset.metadata === 'object'
        ? { ...asset.metadata }
        : {}

    if (assetType === 'email') {
      const domain = normalizedValue.includes('@')
        ? normalizedValue.split('@')[1]
        : null

      if (domain) {
        metadata.domain = domain
      } else {
        delete metadata.domain
      }

      delete metadata.root_domain
      delete metadata.brand_variant
    }

    if (assetType === 'domain') {
      metadata.root_domain = normalizedValue
      delete metadata.domain
      delete metadata.brand_variant
    }

    if (assetType === 'brand') {
      metadata.brand_variant = normalizedValue
      delete metadata.domain
      delete metadata.root_domain
    }

    if (!['email', 'domain', 'brand'].includes(assetType)) {
      delete metadata.domain
      delete metadata.root_domain
      delete metadata.brand_variant
    }

    metadata.updated_by_user_id = context.user.id
    metadata.updated_by_person_id = context.person?.id ?? null

    const { error } = await supabaseAdmin
      .from('monitored_assets')
      .update({
        asset_type: assetType,
        value,
        normalized_value: normalizedValue,
        display_name: displayName || null,
        criticality,
        is_primary: isPrimary,
        is_active: isActive,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asset.id)

    if (error) {
      if (error.code === '23505') {
        return { error: 'Another asset with the same type and value already exists.' }
      }
      return { error: error.message || 'Unable to update asset.' }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error while updating asset.'
    return { error: message }
  }

  redirect(`/dashboard/dark-web/assets/${assetId}?updated=1`)
}