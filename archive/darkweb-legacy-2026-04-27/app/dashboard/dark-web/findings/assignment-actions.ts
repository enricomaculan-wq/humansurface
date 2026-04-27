'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function assignFindingPersonAction(
  findingId: string,
  personId: string | null
) {
  const { error } = await supabaseAdmin
    .from('findings')
    .update({
      assigned_person_id: personId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', findingId)

  if (error) {
    throw new Error(error.message || 'Unable to assign finding.')
  }

  revalidatePath('/dashboard/dark-web/findings')
  revalidatePath(`/dashboard/dark-web/findings/${findingId}`)
  revalidatePath('/dashboard/dark-web')
}

export async function assignTaskPersonAction(
  taskId: string,
  personId: string | null
) {
  const { error } = await supabaseAdmin
    .from('remediation_tasks')
    .update({
      assigned_person_id: personId,
    })
    .eq('id', taskId)

  if (error) {
    throw new Error(error.message || 'Unable to assign task.')
  }

  revalidatePath('/dashboard/dark-web/findings')
  revalidatePath('/dashboard/dark-web')
}