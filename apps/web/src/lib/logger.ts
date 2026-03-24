type Level = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level:     Level
  message:   string
  timestamp: string
  data?:     unknown
}

function log(level: Level, message: string, data?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  }

  // In production emit structured JSON — Railway captures this
  if (process.env.NODE_ENV === 'production') {
    console[level === 'debug' ? 'log' : level](JSON.stringify(entry))
    return
  }

  // In development keep it readable
  const colors: Record<Level, string> = {
    info:  '\x1b[36m',  // cyan
    warn:  '\x1b[33m',  // yellow
    error: '\x1b[31m',  // red
    debug: '\x1b[90m',  // gray
  }
  const reset = '\x1b[0m'
  console[level === 'debug' ? 'log' : level](
    `${colors[level]}[${level.toUpperCase()}]${reset} ${entry.timestamp} ${message}`,
    data ? data : ''
  )
}

export const logger = {
  info:  (msg: string, data?: unknown) => log('info',  msg, data),
  warn:  (msg: string, data?: unknown) => log('warn',  msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
}