export type DarkwebConnectorType =
  | 'manual_seed'
  | 'http_feed'
  | 's3_drop'
  | 'email_ingest'
  | 'csv_upload'

export type NormalizedDarkwebEvent = {
  source_type: string
  source_name?: string | null
  event_type:
    | 'credential_exposure'
    | 'stealer_detected'
    | 'brand_mention'
    | 'pii_exposure'
    | 'access_mention'
  external_id?: string | null
  title: string
  observed_at?: string | null
  payload: Record<string, unknown>
  normalized_text?: string | null
}

export type ConnectorRunContext = {
  connectorId: string
  organizationId: string
  config: Record<string, unknown>
  cursors: Record<string, string | null>
}

export type ConnectorRunResult = {
  events: NormalizedDarkwebEvent[]
  nextCursors?: Record<string, string | null>
}

export interface DarkwebConnector {
  type: DarkwebConnectorType
  run(context: ConnectorRunContext): Promise<ConnectorRunResult>
}