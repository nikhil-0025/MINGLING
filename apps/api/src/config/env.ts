import dotenv from 'dotenv';
dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

export const config = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 4000),
  MONGODB_URI: getEnv('MONGODB_URI', 'mongodb://localhost:27017/mingling'),
  REDIS_URL: getEnv('REDIS_URL', 'redis://localhost:6379'),
  JWT_SECRET: getEnv('JWT_SECRET', 'dev-secret-change-in-production'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '24h'),
  SESSION_EXPIRY_HOURS: getEnvNumber('SESSION_EXPIRY_HOURS', 24),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 60000),
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100),
} as const;