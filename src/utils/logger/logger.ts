import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

const { combine, timestamp, colorize, printf, splat } = winston.format;
const loggingEnabled = process.env.LOGGING_ENABLED?.toLowerCase() !== 'false';
const LOG_ROOT = path.resolve('reports', 'logs');
const date = new Date().toISOString().slice(0, 10);
const logDirectory = path.join(LOG_ROOT, date);
const RUN_ID = process.env.PLAYWRIGHT_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
const FRAMEWORK_LOG_FILE = path.join(logDirectory, 'framework.log');
const MAX_SEED_BYTES = 256 * 1024;
// single source of truth so the key-matcher and value-matcher below can't drift apart
const SECRET_KEYWORDS = 'password|pwd|token|secret|api[-_]?key|authorization|credential';
const secretPattern = new RegExp(SECRET_KEYWORDS, 'i');
const secretValuePattern = new RegExp(`(${SECRET_KEYWORDS})(\\s*[:=]\\s*)(bearer\\s+)?[^\\s,;]+`, 'gi');
// matches JWTs (header.payload.signature) by shape, so tokens are caught regardless of the surrounding key name
const jwtPattern = /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g;
const ansiEscapePattern = /\u001b\[[0-?]*[ -\/]*[@-~]/g;
const controlCharPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const writeMarker = Symbol('writeLogMarker');
const WRITE_TIMEOUT_MS = 10_000;
const IST_TIME_ZONE = 'Asia/Kolkata';

/** Formats the current time in IST so logs are consistent across local and CI machines. */
function formatIstTimestamp(withDate: boolean): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: IST_TIME_ZONE,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const get = (type: string): string => parts.find(part => part.type === type)?.value ?? '';
    const time = `${get('hour')}:${get('minute')}:${get('second')}`;
    return withDate ? `${get('year')}-${get('month')}-${get('day')} ${time} IST` : time;
}

/** Ensures the parent directory exists before Winston or file helpers use a log path. */
function ensureLogDirectory(logFile: string): void {
    if (loggingEnabled) fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

if (loggingEnabled) ensureLogDirectory(FRAMEWORK_LOG_FILE);

/** Converts Error objects and unknown thrown values into safe, structured log metadata. */
export function serializeError(error: unknown): { message: string; stack?: string; name?: string } {
    if (error instanceof Error) {
        return { name: error.name, message: error.message, stack: error.stack };
    }

    if (typeof error === 'string') return { message: error };

    if (error && typeof error === 'object') {
        const testError = error as { name?: unknown; message?: unknown; stack?: unknown };
        if (typeof testError.message === 'string') {
            return {
                name: typeof testError.name === 'string' ? testError.name : undefined,
                message: testError.message,
                stack: typeof testError.stack === 'string' ? testError.stack : undefined,
            };
        }
    }

    try {
        return { message: JSON.stringify(error) ?? String(error) };
    } catch {
        return { message: String(error) };
    }
}

/**
 * Writes a log record and waits until every active transport has accepted it.
 * Skipped log levels and loggers without transports resolve immediately; a
 * timeout prevents a broken transport from blocking test cleanup forever.
 */
export function writeLog(
    log: winston.Logger,
    level: string,
    message: string,
    metadata: Record<string, unknown>,
): Promise<void> {
    if (!loggingEnabled) return Promise.resolve();

    // A level below the logger's threshold never reaches any transport, so
    // 'logged'/'error' would never fire for it — skip waiting entirely.
    const levelWeight = log.levels?.[level];
    const thresholdWeight = log.levels?.[log.level];
    if (typeof levelWeight === 'number' && typeof thresholdWeight === 'number' && levelWeight > thresholdWeight) {
        return Promise.resolve();
    }

    const transports = log.transports;
    if (transports.length === 0) {
        return Promise.resolve();
    }

    const marker = Symbol('write');
    const cleanups: Array<() => void> = [];

    const waitForTransport = (transport: winston.transport): Promise<void> =>
        new Promise<void>((resolve, reject) => {
            const onLogged = (info: { [writeMarker]?: symbol }): void => {
                if (info[writeMarker] === marker) resolve();
            };
            const onError = (error: Error): void => reject(error);
            transport.on('logged', onLogged);
            transport.once('error', onError);
            cleanups.push(() => {
                transport.removeListener('logged', onLogged);
                transport.removeListener('error', onError);
            });
        });

    const allLogged = Promise.all(transports.map(waitForTransport)).then(() => undefined);
    // Safety net: a misbehaving transport that never emits 'logged'/'error' must not hang the caller forever.
    const timeout = new Promise<void>(resolve => setTimeout(resolve, WRITE_TIMEOUT_MS).unref?.());

    log.log({ level, message, ...metadata, [writeMarker]: marker });

    return Promise.race([allLogged, timeout]).finally(() => {
        for (const cleanup of cleanups) cleanup();
    });
}

/** Recursively removes secrets, tokens, PII, terminal escapes, and circular references from log data. */
function redact(value: unknown, key = '', seen = new WeakSet<object>()): unknown {
    if (secretPattern.test(key)) return '[REDACTED]';
    if (value && typeof value === 'object') {
        if (seen.has(value as object)) return '[Circular]';
        seen.add(value as object);
        if (Array.isArray(value)) return value.map(item => redact(item, '', seen));
        return Object.fromEntries(
            Object.entries(value).map(([entryKey, entryValue]) => [entryKey, redact(entryValue, entryKey, seen)])
        );
    }
    if (typeof value === 'string') {
        return value
            // credential-style "key: value" pairs, including "Bearer <token>"
            .replace(secretValuePattern, '$1$2[REDACTED]')
            // catches tokens embedded anywhere, independent of key name or prefix
            .replace(jwtPattern, '[REDACTED_JWT]')
            // mask the local part of email addresses (PII)
            .replace(/\b([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1***$2')
            .replace(ansiEscapePattern, '')
            .replace(controlCharPattern, '');
    }
    return value;
}

/** Converts multiline metadata into arrays so pretty-printed error details remain readable. */
function splitLines(value: unknown, seen = new WeakSet<object>()): unknown {
    if (typeof value === 'string') return value.includes('\n') ? value.split(/\r\n|\r|\n/) : value;
    if (value && typeof value === 'object') {
        if (seen.has(value as object)) return value;
        seen.add(value as object);
        if (Array.isArray(value)) return value.map(item => splitLines(item, seen));
        return Object.fromEntries(
            Object.entries(value).map(([entryKey, entryValue]) => [entryKey, splitLines(entryValue, seen)])
        );
    }
    return value;
}

/** Keeps summary messages on one physical line, preventing newline-based log spoofing. */
function toSummaryLine(value: unknown): string {
    return String(value).replace(/\r\n|\r|\n/g, ' ⏎ ');
}

/** Redacts and formats one record, using multiline metadata only for errors. */
function formatRecord(info: Record<string, unknown>): string {
    // Each transport formats its own record so console and file output cannot diverge on redaction.
    const { timestamp, level, message, ...metadata } = redact(info) as Record<string, unknown>;
    const context = metadata.context ? ` [${metadata.context}]` : '';
    delete metadata.context;
    const isError = String(level).includes('error');
    const details = Object.keys(metadata).length
        ? isError
            ? `\n${JSON.stringify(splitLines(metadata), null, 2)}`
            : ` ${JSON.stringify(metadata)}`
        : '';
    return `${timestamp} ${level}${context} ${toSummaryLine(message)}${details}`;
}

/** Adapts a Winston console record to the shared formatter without a file timestamp. */
function formatConsoleRecord(info: winston.Logform.TransformableInfo): string {
    const { level, message, ...metadata } = info;
    return formatRecord({ timestamp: '', level, message, ...metadata }).replace(/^ /, '');
}

/** Creates the file transport and, outside CI, the colorized console transport for a logger. */
function createTransports(context: string, logFile: string): winston.transport[] {
    if (!loggingEnabled) return [new winston.transports.Console({ silent: true })];
    ensureLogDirectory(logFile);

    const transports: winston.transport[] = [
        new winston.transports.File({
            filename: logFile,
            maxsize: 5 * 1024 * 1024, // cap runaway growth (e.g. a looping/spamming test)
            maxFiles: 3,
            tailable: true,
            format: combine(timestamp({ format: () => formatIstTimestamp(true) }), splat(), winston.format((info) => {
                info.context = context;
                return info;
            })(), printf(formatRecord)),
        }),
    ];

    if (!process.env.CI) {
        transports.push(new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: () => formatIstTimestamp(false) }),
                splat(),
                printf(formatConsoleRecord),
            ),
        }));
    }

    return transports;
}

const scopedLoggers = new Map<string, winston.Logger>();

/** Closes all cached loggers connected to a file and optionally removes them from the cache. */
function closeLoggersForFile(logFile: string, remove: boolean): void {
    for (const [loggerKey, scopedLogger] of scopedLoggers) {
        if (!loggerKey.endsWith(`:${logFile}`)) continue;

        scopedLogger.close();
        if (remove) {
            scopedLoggers.delete(loggerKey);
        } else {
            const context = String(scopedLogger.defaultMeta?.context ?? 'framework');
            scopedLogger.configure({ transports: createTransports(context, logFile) });
        }
    }
}

/**
 * Creates or returns a cached Winston logger for one execution context and log file.
 *
 * The context is written with every record so messages can be traced to a page,
 * test, or framework component. The logger writes to the supplied file, and to
 * the console outside CI. Reusing the same context and file returns the existing
 * logger, which prevents duplicate transports and file handles.
 *
 * Usage: `const log = createLogger('LoginUsers'); log.info('Login started');`
 */
export function createLogger(context: string, logFile = FRAMEWORK_LOG_FILE): winston.Logger {
    const loggerKey = `${context}:${logFile}`;
    const existing = scopedLoggers.get(loggerKey);
    if (existing) return existing;

    const scopedLogger = winston.createLogger({
        level: process.env.LOG_LEVEL ?? 'info',
        silent: !loggingEnabled,
        defaultMeta: { context },
        transports: createTransports(context, logFile),
    });
    scopedLoggers.set(loggerKey, scopedLogger);
    return scopedLogger;
}

/** Closes and evicts a per-test logger so transports/file handles don't accumulate over a long run. */
export function releaseLogger(scopedLogger: winston.Logger): void {
    for (const [loggerKey, candidate] of scopedLoggers) {
        if (candidate !== scopedLogger) continue;
        candidate.close();
        scopedLoggers.delete(loggerKey);
        return;
    }
}

export const logger = createLogger('framework');

/** Returns the dated, run-specific log file used for a test specification. */
export function getSpecLogFilePath(specFile: string): string {
    const relativeSpecFile = path.relative(process.cwd(), specFile);
    const specName = relativeSpecFile
        .replace(/\\/g, '/')
        .replace(/[^a-zA-Z0-9._-]+/g, '_');
    const specLogFile = path.join(logDirectory, `${specName}-${RUN_ID}.log`);

    if (loggingEnabled) ensureLogDirectory(specLogFile);

    if (loggingEnabled && !fs.existsSync(specLogFile)) {
        const size = fs.existsSync(FRAMEWORK_LOG_FILE) ? fs.statSync(FRAMEWORK_LOG_FILE).size : 0;
        if (size > 0) {
            // seed with only the recent tail so this copy can't grow O(n^2) over a long run
            const start = Math.max(0, size - MAX_SEED_BYTES);
            const fd = fs.openSync(FRAMEWORK_LOG_FILE, 'r');
            try {
                const buffer = Buffer.alloc(size - start);
                fs.readSync(fd, buffer, 0, buffer.length, start);
                fs.writeFileSync(specLogFile, buffer);
            } finally {
                fs.closeSync(fd);
            }
        } else {
            fs.writeFileSync(specLogFile, '');
        }
    }

    return specLogFile;
}

/** Closes framework transports, then truncates the framework log for a fresh run. */
export function clearFrameworkLog(): void {
    if (!loggingEnabled) return;
    ensureLogDirectory(FRAMEWORK_LOG_FILE);
    closeLoggersForFile(FRAMEWORK_LOG_FILE, false);
    fs.writeFileSync(FRAMEWORK_LOG_FILE, '');
}

/** Closes and removes the framework log and its cached logger instances. */
export function removeFrameworkLog(): void {
    closeLoggersForFile(FRAMEWORK_LOG_FILE, true);
    fs.rmSync(FRAMEWORK_LOG_FILE, { force: true });
}

/** Returns the framework log size in bytes, or zero when the file does not exist. */
export function getFrameworkLogSize(): number {
    return fs.existsSync(FRAMEWORK_LOG_FILE) ? fs.statSync(FRAMEWORK_LOG_FILE).size : 0;
}

/** Deletes dated log folders older than the retention period to limit disk usage. */
export function pruneOldLogs(retentionDays = 14): void {
    if (!fs.existsSync(LOG_ROOT)) return;
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    for (const entry of fs.readdirSync(LOG_ROOT, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === date) continue;
        const dirPath = path.join(LOG_ROOT, entry.name);
        if (fs.statSync(dirPath).mtimeMs < cutoff) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    }
}

/** Flushes the framework logger and appends new framework records to matching spec logs. */
export async function appendFrameworkLogToSpecLogs(
    sourceLogger: winston.Logger,
    startOffset: number,
): Promise<void> {
    await new Promise<void>((resolve) => {
        sourceLogger.on('finish', resolve);
        sourceLogger.end();
    });

    if (!fs.existsSync(FRAMEWORK_LOG_FILE)) return;

    const frameworkLog = fs.readFileSync(FRAMEWORK_LOG_FILE).subarray(startOffset);
    if (!frameworkLog.length) return;

    for (const file of fs.readdirSync(logDirectory)) {
        if (file.endsWith(`-${RUN_ID}.log`) && file.includes('.spec.ts')) {
            fs.appendFileSync(path.join(logDirectory, file), frameworkLog);
        }
    }
}
