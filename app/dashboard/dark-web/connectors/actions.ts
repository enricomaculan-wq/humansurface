'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { runDarkwebConnector } from '@/lib/darkweb/connectors/run-connector'
import { requireOwnedConnector } from '@/lib/darkweb/ownership'

export async function runConnectorNowAction(connectorId: string) {
  const { connector, context } = await requireOwnedConnector(connectorId)

  await runDarkwebConnector(connector.id, {
    triggerType: 'manual',
    triggeredByUserId: context.user.id,
    triggeredByPersonId: context.person?.id ?? null,
  })

  revalidatePath('/dashboard/dark-web/connectors')
  revalidatePath('/dashboard/dark-web/inbox')
  revalidatePath('/dashboard/dark-web/findings')
  revalidatePath('/dashboard/dark-web/alerts')
  revalidatePath('/dashboard/dark-web/metrics')
  revalidatePath('/dashboard/dark-web')
}

export async function setConnectorStatusAction(
  connectorId: string,
  nextStatus: 'active' | 'paused'
) {
  if (!['active', 'paused'].includes(nextStatus)) {
    throw new Error('Invalid connector status.')
  }

  const { connector, context } = await requireOwnedConnector(connectorId)

  const nextConfig =
    connector.config && typeof connector.config === 'object'
      ? {
          ...connector.config,
          updated_by_user_id: context.user.id,
          updated_by_person_id: context.person?.id ?? null,
        }
      : {
          updated_by_user_id: context.user.id,
          updated_by_person_id: context.person?.id ?? null,
        }

  const { error } = await supabaseAdmin
    .from('darkweb_connectors')
    .update({
      status: nextStatus,
      config: nextConfig,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connector.id)

  if (error) {
    throw new Error(error.message || 'Unable to update connector status.')
  }

  revalidatePath('/dashboard/dark-web/connectors')
}