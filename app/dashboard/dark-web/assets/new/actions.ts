'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireCurrentDarkwebContext } from '@/lib/darkweb/context'

export type CreateAssetFormState = {
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

export async function createMonitoredAssetAction(
  _prevState: CreateAssetFormState,
  formData: FormData
): Promise<CreateAssetFormState> {
  try {
    const context = await requireCurrentDarkwebContext()

    const assetType = String(formData.get('asset_type') ?? '').trim()
    const value = String(formData.get('value') ?? '').trim()
    const displayName = String(formData.get('display_name') ?? '').trim()
    const inputCriticality = String(formData.get('criticality') ?? 'medium').trim()
    const isPrimary = formData.get('is_primary') === 'on'
    const isActive = formData.get('is_active') === 'on'

    if (!assetType) {
      return { error: 'Asset type is required.' }
    }

    if (!value) {
      return { error: 'Asset value is required.' }
    }

    const allowedTypes = ['domain', 'email', 'brand', 'person', 'username', 'phone']
    const allowedCriticalities = ['low', 'medium', 'high', 'critical']

    if (!allowedTypes.includes(assetType)) {
      return { error: 'Invalid asset type.' }
    }

    if (!allowedCriticalities.includes(inputCriticality)) {
      return { error: 'Invalid criticality.' }
    }

    if (assetType === 'email' && !value.includes('@')) {
      return { error: 'Please enter a valid email asset.' }
    }

    const organizationId = context.organization.id
    const normalizedValue = normalizeAssetValue(assetType, value)
    const criticality = autoCriticality(assetType, value, inputCriticality)

    const payload: Record<string, unknown> = {
      created_by_user_id: context.user.id,
    }

    if (context.person?.id) {
      payload.created_by_person_id = context.person.id
    }

    if (assetType === 'email') {
      const domain = normalizedValue.includes('@')
        ? normalizedValue.split('@')[1]
        : null
      if (domain) payload.domain = domain
    }

    if (assetType === 'domain') {
      payload.root_domain = normalizedValue
    }

    if (assetType === 'brand') {
      payload.brand_variant = normalizedValue
    }

    const { error } = await supabaseAdmin.from('monitored_assets').insert({
      organization_id: organizationId,
      asset_type: assetType,
      value,
      normalized_value: normalizedValue,
      display_name: displayName || null,
      criticality,
      verification_status: 'verified',
      source: 'manual',
      is_active: isActive,
      is_primary: isPrimary,
      metadata: payload,
      tags: [],
    })

    if (error) {
      if (error.code === '23505') {
        return { error: 'This asset already exists.' }
      }

      return { error: error.message || 'Unable to save asset.' }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error while saving asset.'
    return { error: message }
  }

  redirect('/dashboard/dark-web/assets?created=1')
}