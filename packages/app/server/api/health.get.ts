import { isSetupComplete } from '../utils/setup'
import { config } from '../../../../forgecrawl.config'

export default defineEventHandler(() => {
  let setupComplete = false
  let dbStatus = 'ok'

  try {
    setupComplete = isSetupComplete()
  } catch {
    dbStatus = 'error'
  }

  return {
    status: 'ok',
    version: config.app.version,
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    database: dbStatus,
    setup_complete: setupComplete,
  }
})
