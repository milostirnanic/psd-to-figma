/**
 * Backend-specific type definitions
 * Re-export shared types and add backend-only types
 */

export * from '../../../shared/types';

// Additional backend-specific types can go here
import { Request } from 'express';

export interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}
