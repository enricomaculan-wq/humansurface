'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireOwnedFinding } from '@/lib/darkweb/ownership'

const allowedStatuses = [
  'new',
  'reviewed',
  'in_progress',
  'resolved',
  'suppressed',
] as const

type FindingStatus = (typeof allowedStatuses)[number]

export async function updateFindingStatusAction(
  findingId: string,
  nextStatus: FindingStatus
) {
  if (!allowedStatuses.includes(nextStatus)) {
    throw new Error('Invalid finding status.')
  }

  const { finding, context } = await requireOwnedFinding(findingId)

  const metadata =
    finding.metadata && typeof finding.metadata === 'object'
      ? { ...finding.metadata }
      : {}

  metadata.updated_by_user_id = context.user.id
  metadata.updated_by_person_id = context.person?.id ?? null
  metadata.last_status_change_at = new Date().toISOString()
  metadata.last_status_change_to = nextStatus

  const { error } = await supabaseAdmin
    .from('findings')
    .update({
      finding_status: nextStatus,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', finding.id)

  if (error) {
    throw new Error(error.message || 'Unable to update finding status.')
  }

  revalidatePath('/dashboard/dark-web')
  revalidatePath('/dashboard/dark-web/findings')
  revalidatePath(`/dashboard/dark-web/findings/${finding.id}`)
  revalidatePath('/dashboard/dark-web/metrics')
  revalidatePath('/dashboard/dark-web/queue')
}

export async function saveFindingNoteAction(
  findingId: string,
  formData: FormData
) {
  const { finding, context } = await requireOwnedFinding(findingId)

  const note = String(formData.get('note') ?? '').trim()

  const metadata =
    finding.metadata && typeof finding.metadata === 'object'
      ? { ...finding.metadata }
      : {}

  metadata.analyst_note = note || null
  metadata.note_updated_by_user_id = context.user.id
  metadata.note_updated_by_person_id = context.person?.id ?? null
  metadata.note_updated_at = new Date().toISOString()

  const { error } = await supabaseAdmin
    .from('findings')
    .update({
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', finding.id)

  if (error) {
    throw new Error(error.message || 'Unable to save finding note.')
  }

  revalidatePath('/dashboard/dark-web')
  revalidatePath('/dashboard/dark-web/findings')
  revalidatePath(`/dashboard/dark-web/findings/${finding.id}`)
  revalidatePath('/dashboard/dark-web/queue')
}