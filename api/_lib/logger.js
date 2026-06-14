let requestCounter = 0;

function generateRequestId() {
  requestCounter++;
  const timestamp = Date.now().toString(36);
  const counter = requestCounter.toString(36).padStart(4, "0");
  return `req_${timestamp}_${counter}`;
}

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const requestId = meta.requestId || "-";
  const prefix = `[${timestamp}] [${level}] [${requestId}]`;
  const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : "";
  return `${prefix} ${message}${metaStr}`;
}

export function createLogger(requestId) {
  const id = requestId || generateRequestId();

  function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] < CURRENT_LEVEL) return;
    const output = formatLog(level, message, { ...meta, requestId: id });
    if (level === "ERROR") {
      console.error(output);
    } else if (level === "WARN") {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  return {
    requestId: id,
    debug: (msg, meta) => log("DEBUG", msg, meta),
    info: (msg, meta) => log("INFO", msg, meta),
    warn: (msg, meta) => log("WARN", msg, meta),
    error: (msg, meta) => log("ERROR", msg, meta),
    child: (extraMeta) => ({
      ...createLogger(id),
      debug: (msg, meta) => log("DEBUG", msg, { ...extraMeta, ...meta }),
      info: (msg, meta) => log("INFO", msg, { ...extraMeta, ...meta }),
      warn: (msg, meta) => log("WARN", msg, { ...extraMeta, ...meta }),
      error: (msg, meta) => log("ERROR", msg, { ...extraMeta, ...meta }),
    }),
  };
}

export function withTiming(logger, label, fn) {
  const start = Date.now();
  return Promise.resolve(fn()).finally(() => {
    const duration = Date.now() - start;
    logger.info(`${label} completed`, { durationMs: duration });
  });
}

export const rootLogger = createLogger();
