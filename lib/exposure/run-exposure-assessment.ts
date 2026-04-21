import { runPublicScanForOrganization } from '@/lib/scanner/run-scan'
import { runExternalPublicScanForAssessment } from '@/lib/scanner/run-external-scan'
import { runAllActiveDarkwebConnectors } from '@/lib/darkweb/connectors/run-all'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { processDarkwebRawEvent } from '@/lib/darkweb/matcher'

async function processPendingDarkwebEventsForOrganization(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from('darkweb_raw_events')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('processing_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    throw new Error(error.message || 'Unable to load pending dark web raw events.')
  }

  const results: Array<{ id: string; ok: boolean; error?: string }> = []

  for (const row of data ?? []) {
    try {
      await processDarkwebRawEvent(row.id)
      results.push({ id: row.id, ok: true })
    } catch (error) {
      results.push({
        id: row.id,
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected matcher error',
      })
    }
  }

  return {
    total: (data ?? []).length,
    processed: results.filter((item) => item.ok).length,
    failed: results.filter((item) => !item.ok).length,
    results,
  }
}

export async function runExposureAssessmentForOrganization(organizationId: string) {
  const websiteResult = await runPublicScanForOrganization(organizationId)

  const externalResult = await runExternalPublicScanForAssessment(
    websiteResult.assessmentId,
    organizationId
  )

  const connectorRunResult = await runAllActiveDarkwebConnectors({
    organizationId,
    triggerType: 'system',
    limit: 20,
  })

  const darkwebProcessingResult =
    await processPendingDarkwebEventsForOrganization(organizationId)

  return {
    assessmentId: websiteResult.assessmentId,
    organizationId,
    website: websiteResult,
    external: externalResult,
    darkwebConnectors: connectorRunResult,
    darkwebProcessing: darkwebProcessingResult,
  }
}