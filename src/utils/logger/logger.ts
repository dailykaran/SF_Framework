import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

const { combine, timestamp, colorize, printf, splat } = winston.format;
const LOG_ROOT = path.resolve('reports', 'logs');
const date = new Date().toISOString().slice(0, 10);
const logDirectory = path.join(LOG_ROOT, date);
const RUN_ID = process.env.PLAYWRIGHT_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
const FRAMEWORK_LOG_FILE = path.join(logDirectory, 'framework.log');
const secretPattern = /(password|token|secret|api[-_]?key|authorization)/i;
const ansiEscapePattern = /\u001b\[[0-?]*[ -\/]*[@-~]/g;

fs.mkdirSync(logDirectory, { recursive: true });

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

export function writeLog(
    log: winston.Logger,
    level: string,
    message: string,
    metadata: Record<string, unknown>,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const transports = log.transports;
        let written = 0;
        const onLogged = (): void => {
            written += 1;
            if (written === transports.length) resolve();
        };

        for (const transport of transports) {
            transport.once('logged', onLogged);
        }

        try {
            log.log(level, message, metadata);
        } catch (error) {
            reject(error);
        }
    });
}

function redact(value: unknown, key = ''): unknown {
    if (secretPattern.test(key)) return '[REDACTED]';
    if (Array.isArray(value)) return value.map(item => redact(item));
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([entryKey, entryValue]) => [entryKey, redact(entryValue, entryKey)])
        );
    }
    if (typeof value === 'string') {
        return value.replace(/(password|token|secret|api[-_]?key|authorization)(\s*[:=]\s*)[^\s,;]+/gi, '$1$2[REDACTED]');
    }
    return value;
}

function stripAnsi(value: unknown): unknown {
    if (typeof value === 'string') return value.replace(ansiEscapePattern, '');
    if (Array.isArray(value)) return value.map(stripAnsi);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, entryValue]) => [key, stripAnsi(entryValue)])
        );
    }
    return value;
}

function formatFileRecord(info: winston.Logform.TransformableInfo): string {
    const { timestamp, level, message, ...metadata } = stripAnsi(info) as Record<string, unknown>;
    const context = metadata.context ? ` [${metadata.context}]` : '';
    delete metadata.context;
    const details = Object.keys(metadata).length
        ? `\n${JSON.stringify(metadata, null, 2)}`
        : '';
    return `${timestamp} ${level}${context} ${message}${details}`;
}

function createTransports(context: string, logFile: string): winston.transport[] {
    const transports: winston.transport[] = [
        new winston.transports.File({
            filename: logFile,
            format: combine(timestamp(), splat(), winston.format((info) => {
                Object.assign(info, redact({ ...info }), { context });
                return info;
            })(), printf(formatFileRecord)),
        }),
    ];

    if (!process.env.CI) {
        transports.push(new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'HH:mm:ss' }),
                splat(),
                printf(({ level, message, ...metadata }) => {
                    const contextText = metadata.context ? ` [${metadata.context}]` : '';
                    const details = Object.keys(metadata).filter(key => key !== 'context').length
                        ? ` ${JSON.stringify(redact(metadata))}`
                        : '';
                    return `${level}${contextText} ${redact(message)}${details}`;
                }),
            ),
        }));
    }

    return transports;
}

const scopedLoggers = new Map<string, winston.Logger>();

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

export function createLogger(context: string, logFile = FRAMEWORK_LOG_FILE): winston.Logger {
    const loggerKey = `${context}:${logFile}`;
    const existing = scopedLoggers.get(loggerKey);
    if (existing) return existing;

    const scopedLogger = winston.createLogger({
        level: process.env.LOG_LEVEL ?? 'info',
        defaultMeta: { context },
        transports: createTransports(context, logFile),
    });
    scopedLoggers.set(loggerKey, scopedLogger);
    return scopedLogger;
}

export const logger = createLogger('framework');

export function getSpecLogFilePath(specFile: string): string {
    const relativeSpecFile = path.relative(process.cwd(), specFile);
    const specName = relativeSpecFile
        .replace(/\\/g, '/')
        .replace(/[^a-zA-Z0-9._-]+/g, '_');
    const specLogFile = path.join(logDirectory, `${specName}-${RUN_ID}.log`);

    if (!fs.existsSync(specLogFile)) {
        if (fs.existsSync(FRAMEWORK_LOG_FILE)) {
            fs.copyFileSync(FRAMEWORK_LOG_FILE, specLogFile);
        } else {
            fs.writeFileSync(specLogFile, '');
        }
    }

    return specLogFile;
}

export function clearFrameworkLog(): void {
    closeLoggersForFile(FRAMEWORK_LOG_FILE, false);
    fs.writeFileSync(FRAMEWORK_LOG_FILE, '');
}

export function removeFrameworkLog(): void {
    closeLoggersForFile(FRAMEWORK_LOG_FILE, true);
    fs.rmSync(FRAMEWORK_LOG_FILE, { force: true });
}

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
