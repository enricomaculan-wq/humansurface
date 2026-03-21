export type ExternalSearchSeed = {
  organizationId: string
  organizationName: string
  domain: string
}

export type ExternalSearchResult = {
  query: string
  title: string
  url: string
  snippet: string
  sourceType:
    | 'linkedin'
    | 'press'
    | 'directory'
    | 'job_board'
    | 'news'
    | 'company_page'
    | 'other'
  sourceDomain: string | null
}

export type ExternalSearchDebug = {
  query: string
  ok: boolean
  resultCount: number
  error?: string
}

export type ExternalSearchResponse = {
  results: ExternalSearchResult[]
  debug: ExternalSearchDebug[]
}