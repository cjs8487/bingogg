import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { testing } from './Environment';

const { combine, timestamp, json, cli, printf } = format;

const logFormat = combine(timestamp(), json());

export const rotateTransport: DailyRotateFile = new DailyRotateFile({
    filename: 'playbingo-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d',
    zippedArchive: true,
    createSymlink: true,
    symlinkName: 'current.log',
    handleExceptions: true,
    handleRejections: true,
});

export const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [rotateTransport],
    exitOnError: false,
});

if (testing) {
    logger.level = 'silly';
    logger.add(
        new transports.Console({
            format: combine(
                timestamp({ format: 'ddd MMMM D YYYY h:mm:ss A' }),
                cli(),
                printf((info) => {
                    let end = '';
                    if (info.ip) {
                        end += `[${info.ip} ${info.durationMs}ms]`;
                    }
                    return `${info.timestamp} [${info.level}] ${info.message} ${end}`;
                }),
            ),
            handleExceptions: true,
            handleRejections: true,
        }),
    );
}

export const logDebug = (message: string, meta?: { [k: string]: string }) => {
    logger.log('debug', message, meta);
};

export const logVerbose = (message: string, meta?: { [k: string]: string }) => {
    logger.log('verbose', message, meta);
};

export const logInfo = (message: string, meta?: { [k: string]: string }) => {
    logger.log('info', message, meta);
};

export const logWarn = (message: string, meta?: { [k: string]: string }) => {
    logger.log('warn', message, meta);
};

export const logError = (message: string, meta?: { [k: string]: string }) => {
    logger.log('error', message, meta);
};
