type Level = 'debug' | 'info' | 'warn' | 'error'

type Context = Record<string, unknown>

const isProd = process.env.NODE_ENV === 'production'

function serializeError(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack }
  }
  return value
}

function emit(level: Level, event: string, context?: Context) {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    event,
  }
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      entry[key] = serializeError(value)
    }
  }

  const sink = level === 'debug' ? console.log : console[level]
  if (isProd) {
    sink(JSON.stringify(entry))
  } else {
    sink(`[${level}] ${event}`, context ?? '')
  }
}

export const logger = {
  debug: (event: string, context?: Context) => emit('debug', event, context),
  info: (event: string, context?: Context) => emit('info', event, context),
  warn: (event: string, context?: Context) => emit('warn', event, context),
  error: (event: string, context?: Context) => emit('error', event, context),
}
