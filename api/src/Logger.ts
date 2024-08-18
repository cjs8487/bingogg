import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { testing } from './Environment';

const { combine, timestamp, json } = format;

const logFormat = combine(timestamp(), json());

export const rotateTransport: DailyRotateFile = new DailyRotateFile({
    filename: 'playbingo-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d',
    zippedArchive: true,
    createSymlink: true,
    symlinkName: 'current.log',
});

export const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [rotateTransport],
});

if (testing) {
    logger.level = 'silly';
    logger.add(new transports.Console());
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
