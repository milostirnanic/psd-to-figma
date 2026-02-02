import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  figmaAccessToken: string;
  figmaProjectId: string;
  uploadDir: string;
  maxFileSize: number;
  allowedOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

function getConfig(): AppConfig {
  const config: AppConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN || '',
    figmaProjectId: process.env.FIGMA_PROJECT_ID || '',
    uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB default
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  };

  // Validate required config
  if (!config.figmaAccessToken && config.nodeEnv === 'production') {
    console.warn('WARNING: FIGMA_ACCESS_TOKEN is not set!');
  }

  if (!config.figmaProjectId) {
    console.warn('WARNING: FIGMA_PROJECT_ID is not set! Files cannot be created in Figma.');
  }

  return config;
}

export const config = getConfig();

export default config;
