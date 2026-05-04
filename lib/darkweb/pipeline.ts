import { ingestDarkwebRawResults, type DarkwebRawIngestionInput } from './ingest'
import { matchAndPersistDarkwebFindings } from './match'
import {
  createDarkwebSearchRun,
  listDarkwebRawResultsForRun,
  listDarkwebSeedsForRun,
  listMonitoredAssetsForDarkwebSeeds,
  persistDarkwebScoreSnapshot,
  persistDarkwebSeeds,
  updateDarkwebSearchRunStatus,
} from './repository'
import { calculateDarkwebScore } from './scoring'
import { buildDarkwebSeedsFromMonitoredAssets } from './seeds'
import type {
  DarkwebFindingRecord,
  DarkwebRawResultRecord,
  DarkwebScoreSummary,
  DarkwebSearchRunRecord,
  DarkwebSearchRunTrigger,
  DarkwebSeedRecord,
  JsonRecord,
} from './types'

export type GenerateDarkwebSeedsResult = {
  monitoredAssetCount: number
  seeds: DarkwebSeedRecord[]
}

export type ProcessDarkwebRunResult = {
  run: DarkwebSearchRunRecord
  seeds: DarkwebSeedRecord[]
  rawResults: DarkwebRawResultRecord[]
  findings: DarkwebFindingRecord[]
  score: DarkwebScoreSummary
}

export async function generateDarkwebSeedsForRun(params: {
  runId: string
  organizationId: string
  assessmentId?: string | null
}): Promise<GenerateDarkwebSeedsResult> {
  const monitoredAssets = await listMonitoredAssetsForDarkwebSeeds(params.organizationId)
  const seeds = buildDarkwebSeedsFromMonitoredAssets(monitoredAssets)
  const persistedSeeds = await persistDarkwebSeeds({
    runId: params.runId,
    organizationId: params.organizationId,
    assessmentId: params.assessmentId ?? null,
    seeds,
  })

  return {
    monitoredAssetCount: monitoredAssets.length,
    seeds: persistedSeeds,
  }
}

export async function processDarkwebSearchRun(params: {
  runId: string
  organizationId: string
  assessmentId?: string | null
  seeds?: DarkwebSeedRecord[]
  rawResults?: DarkwebRawResultRecord[]
  metadata?: JsonRecord
}): Promise<ProcessDarkwebRunResult> {
  const seeds = params.seeds ?? (await listDarkwebSeedsForRun(params.runId))
  const rawResults =
    params.rawResults ?? (await listDarkwebRawResultsForRun(params.runId))
  const findings = await matchAndPersistDarkwebFindings({
    runId: params.runId,
    organizationId: params.organizationId,
    assessmentId: params.assessmentId ?? null,
    rawResults,
    seeds,
  })
  const score = calculateDarkwebScore(findings)

  await persistDarkwebScoreSnapshot({
    runId: params.runId,
    organizationId: params.organizationId,
    assessmentId: params.assessmentId ?? null,
    summary: score,
    metadata: params.metadata,
  })

  const run = await updateDarkwebSearchRunStatus({
    runId: params.runId,
    status: 'completed',
    metadata: {
      ...(params.metadata ?? {}),
      seed_count: seeds.length,
      raw_result_count: rawResults.length,
      finding_count: findings.length,
      score: score.score,
      risk_level: score.riskLevel,
    },
  })

  return {
    run,
    seeds,
    rawResults,
    findings,
    score,
  }
}

export async function runInternalDarkwebPipeline(params: {
  organizationId: string
  assessmentId?: string | null
  triggerSource?: DarkwebSearchRunTrigger
  rawResults?: DarkwebRawIngestionInput[]
  metadata?: JsonRecord
}): Promise<ProcessDarkwebRunResult> {
  const run = await createDarkwebSearchRun({
    organizationId: params.organizationId,
    assessmentId: params.assessmentId ?? null,
    triggerSource: params.triggerSource ?? 'manual',
    metadata: params.metadata,
  })

  try {
    await updateDarkwebSearchRunStatus({
      runId: run.id,
      status: 'running',
      metadata: params.metadata,
    })

    const seedResult = await generateDarkwebSeedsForRun({
      runId: run.id,
      organizationId: params.organizationId,
      assessmentId: params.assessmentId ?? null,
    })

    const ingestedRawResults =
      params.rawResults && params.rawResults.length > 0
        ? await ingestDarkwebRawResults({
            runId: run.id,
            organizationId: params.organizationId,
            assessmentId: params.assessmentId ?? null,
            results: params.rawResults,
          })
        : []

    return processDarkwebSearchRun({
      runId: run.id,
      organizationId: params.organizationId,
      assessmentId: params.assessmentId ?? null,
      seeds: seedResult.seeds,
      rawResults: ingestedRawResults,
      metadata: {
        ...(params.metadata ?? {}),
        monitored_seed_count: seedResult.monitoredAssetCount,
        ingested_raw_result_count: ingestedRawResults.length,
      },
    })
  } catch (error) {
    await updateDarkwebSearchRunStatus({
      runId: run.id,
      status: 'failed',
      errorMessage:
        error instanceof Error ? error.message : 'Unexpected dark web pipeline error.',
      metadata: params.metadata,
    })

    throw error
  }
}
