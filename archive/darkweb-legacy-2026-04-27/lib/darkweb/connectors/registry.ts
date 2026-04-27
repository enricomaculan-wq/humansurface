import { HttpFeedConnector } from './http-feed'
import { ManualSeedConnector } from './manual-seed'
import type { DarkwebConnector, DarkwebConnectorType } from './types'

export function getDarkwebConnector(type: DarkwebConnectorType): DarkwebConnector {
  if (type === 'manual_seed') {
    return new ManualSeedConnector()
  }

  if (type === 'http_feed') {
    return new HttpFeedConnector()
  }

  throw new Error(`Unsupported connector type: ${type}`)
}