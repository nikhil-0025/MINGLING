import winston from 'winston';
import { config } from './env';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (stack) msg += `\n${stack}`;
  return msg;
});

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'mingling-api' },
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp(),
        config.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat)
      ),
    }),
  ],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});