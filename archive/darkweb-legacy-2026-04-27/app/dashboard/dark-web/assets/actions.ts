'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireOwnedMonitoredAsset } from '@/lib/darkweb/ownership'

function revalidateAssetPages(assetId?: string) {
  revalidatePath('/dashboard/dark-web')
  revalidatePath('/dashboard/dark-web/assets')
  revalidatePath('/dashboard/dark-web/findings')
  revalidatePath('/dashboard/dark-web/metrics')
  if (assetId) {
    revalidatePath(`/dashboard/dark-web/assets/${assetId}`)
    revalidatePath(`/dashboard/dark-web/assets/${assetId}/edit`)
  }
}

export async function setMonitoredAssetActiveStateAction(
  assetId: string,
  nextIsActive: boolean
) {
  const { asset, context } = await requireOwnedMonitoredAsset(assetId)

  const metadata =
    asset.metadata && typeof asset.metadata === 'object'
      ? { ...asset.metadata }
      : {}

  metadata.updated_by_user_id = context.user.id
  metadata.updated_by_person_id = context.person?.id ?? null
  metadata.last_active_state_change_at = new Date().toISOString()
  metadata.last_active_state = nextIsActive

  const { error } = await supabaseAdmin
    .from('monitored_assets')
    .update({
      is_active: nextIsActive,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', asset.id)

  if (error) {
    throw new Error(error.message || 'Unable to update asset status.')
  }

  revalidateAssetPages(asset.id)
}

export async function deleteMonitoredAssetAction(assetId: string) {
  const { asset, context } = await requireOwnedMonitoredAsset(assetId)

  const { error: unlinkError } = await supabaseAdmin
    .from('finding_assets')
    .delete()
    .eq('asset_id', asset.id)

  if (unlinkError) {
    throw new Error(unlinkError.message || 'Unable to unlink asset from findings.')
  }

  const { error: deleteError } = await supabaseAdmin
    .from('monitored_assets')
    .delete()
    .eq('id', asset.id)

  if (deleteError) {
    throw new Error(deleteError.message || 'Unable to delete asset.')
  }

  await supabaseAdmin.from('darkweb_raw_events').insert({
    organization_id: asset.organization_id,
    source_type: 'system',
    source_name: 'asset_delete_audit',
    event_type: 'access_mention',
    title: `Asset deleted: ${asset.display_name ?? asset.value}`,
    raw_payload: {
      deleted_asset_id: asset.id,
      deleted_asset_type: asset.asset_type,
      deleted_asset_value: asset.value,
      deleted_by_user_id: context.user.id,
      deleted_by_person_id: context.person?.id ?? null,
      audit_only: true,
    },
    normalized_text: null,
    observed_at: new Date().toISOString(),
    processing_status: 'no_match',
    matched_asset_count: 0,
    processed_at: new Date().toISOString(),
  })

  revalidateAssetPages()
}