export type ExtractedPdfSignal = {
  url: string
  title: string
  text: string
  emails: string[]
  hasLeadershipSignals: boolean
  hasFinanceSignals: boolean
  hasHrSignals: boolean
  hasContactSignals: boolean
}

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

export async function extractSignalsFromPdfUrl(
  url: string,
): Promise<ExtractedPdfSignal | null> {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'HumanSurfaceScanner/1.0' },
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type') || ''
    if (!response.ok) return null
    if (!contentType.includes('pdf')) return null

    let pdfParse: ((buffer: Buffer) => Promise<{ text?: string }>) | null = null

    try {
      const mod: unknown = await import('pdf-parse')
      pdfParse = mod as (buffer: Buffer) => Promise<{ text?: string }>
    } catch (error) {
      console.warn('[PDF] parser unavailable, skipping pdf parsing for', url, error)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const parsed = await pdfParse(buffer)
    const text = cleanText(parsed?.text || '')
    if (!text) return null

    const emails = unique((text.match(EMAIL_REGEX) || []).map((e) => e.toLowerCase()))
    const lower = text.toLowerCase()

    return {
      url,
      title: url.split('/').pop() || 'PDF document',
      text,
      emails,
      hasLeadershipSignals:
        /ceo|cfo|coo|cto|founder|leadership|management|board|executive|director/.test(lower),
      hasFinanceSignals:
        /finance|billing|invoice|accounts payable|accounts receivable|payments|procurement|bank detail|supplier/.test(lower),
      hasHrSignals:
        /hr|human resources|recruiting|recruitment|careers|jobs|talent|candidate/.test(lower),
      hasContactSignals:
        /contact|email us|get in touch|reach us/.test(lower),
    }
  } catch (error) {
    console.warn('[PDF] failed to parse', url, error)
    return null
  }
}