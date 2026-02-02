/**
 * Simple logger utility
 * Can be replaced with Winston or Pino in the future
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, error?: Error | any): void {
    const meta = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(this.formatMessage('error', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
export default logger;
