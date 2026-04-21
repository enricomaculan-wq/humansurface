import type { ConnectorRunContext, ConnectorRunResult, DarkwebConnector } from './types'

export class ManualSeedConnector implements DarkwebConnector {
  type = 'manual_seed' as const

  async run(context: ConnectorRunContext): Promise<ConnectorRunResult> {
    const now = new Date().toISOString()
    const domain =
      typeof context.config.domain === 'string'
        ? context.config.domain
        : 'humansurface.demo'

    const email =
      typeof context.config.email === 'string'
        ? context.config.email
        : `admin@${domain}`

    return {
      events: [
        {
          source_type: 'stealer_log',
          source_name: 'Manual Seed Connector',
          event_type: 'credential_exposure',
          external_id: `manual-seed-${Date.now()}`,
          title: `Credential exposure detected for ${email}`,
          observed_at: now,
          normalized_text: `credential exposure ${email} ${domain}`,
          payload: {
            email,
            domain,
            snippet: `Matched asset: ${email} in seeded credential context`,
          },
        },
      ],
      nextCursors: {
        last_run_at: now,
      },
    }
  }
}