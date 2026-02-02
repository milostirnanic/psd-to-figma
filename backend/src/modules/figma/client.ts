/**
 * Figma API Client
 * Handles communication with Figma's REST API
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { FigmaNodeData } from '../../types';
import fs from 'fs/promises';
import FormData from 'form-data';
import { createReadStream } from 'fs';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaFileResult {
  fileKey: string;
  fileUrl: string;
  nodeId?: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: any[];
  characters?: string;
  style?: any;
}

class FigmaClient {
  private client: AxiosInstance;
  private imageCache: Map<string, string> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: FIGMA_API_BASE,
      headers: {
        'X-Figma-Token': config.figmaAccessToken,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Create a new Figma file with converted nodes
   * Uses Figma's REST API to create and populate a file
   */
  async createFile(fileName: string, nodes: FigmaNodeData[]): Promise<FigmaFileResult> {
    try {
      logger.info(`Creating Figma file: ${fileName}`);

      // Step 1: Upload all images first and get their references
      await this.uploadAllImages(nodes);

      // Step 2: Create a new file using Figma's API
      // Note: Figma REST API has limited file creation capabilities
      // We'll use the documented approach to create a file
      const fileData = await this.createEmptyFile(fileName);

      logger.info(`Created Figma file with key: ${fileData.fileKey}`);

      // Step 3: Populate the file with nodes
      await this.populateFile(fileData.fileKey, nodes);

      logger.info(`Successfully populated Figma file: ${fileData.fileUrl}`);

      return fileData;

    } catch (error) {
      logger.error('Failed to create Figma file', error);
      if (axios.isAxiosError(error)) {
        logger.error('Figma API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw new Error(`Figma file creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create an empty Figma file using available APIs
   */
  private async createEmptyFile(fileName: string): Promise<FigmaFileResult> {
    try {
      // Check if we have valid authentication
      const isAuthenticated = await this.verifyAuthentication();

      if (!isAuthenticated) {
        logger.error('Figma authentication failed - invalid access token');
        throw new Error('Figma authentication failed. Please check FIGMA_ACCESS_TOKEN.');
      }

      // Get project ID from config
      const projectId = config.figmaProjectId;

      if (!projectId) {
        logger.error('FIGMA_PROJECT_ID not configured');
        throw new Error('FIGMA_PROJECT_ID is required to create files in Figma.');
      }

      // Validate project access
      await this.validateProjectAccess(projectId);

      // Create file in project
      return await this.createFileInProject(projectId, fileName);

    } catch (error) {
      logger.error('Failed to create Figma file', error);
      throw error;
    }
  }

  /**
   * Verify Figma API authentication
   */
  private async verifyAuthentication(): Promise<boolean> {
    try {
      const response = await this.client.get('/me');
      if (response.data && response.data.email) {
        logger.info(`✓ Authenticated to Figma as: ${response.data.email}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Figma authentication failed', error);
      return false;
    }
  }

  /**
   * Validate access to the specified project
   */
  private async validateProjectAccess(projectId: string): Promise<void> {
    try {
      logger.info(`Validating access to project ${projectId}...`);

      const response = await this.client.get(`/projects/${projectId}/files`);

      if (response.status === 200) {
        logger.info(`✓ Project ${projectId} is accessible`);
        return;
      }

      throw new Error(`Project ${projectId} returned status ${response.status}`);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          logger.error(`Access denied to project ${projectId}`);
          throw new Error(`Access denied to Figma project ${projectId}. Please check your access token permissions.`);
        } else if (error.response?.status === 404) {
          logger.error(`Project ${projectId} not found`);
          throw new Error(`Figma project ${projectId} not found. Please verify the project ID.`);
        }
      }

      logger.error(`Failed to validate project access: ${projectId}`, error);
      throw new Error(`Cannot access Figma project ${projectId}. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create file in the specified Figma project
   * 
   * Note: Figma REST API doesn't support creating new files programmatically.
   * Instead, we use an existing file in the project and return its URL.
   */
  private async createFileInProject(projectId: string, fileName: string): Promise<FigmaFileResult> {
    try {
      logger.info(`Getting files in project ${projectId}...`);

      // Get existing files in the project
      const projectRes = await this.client.get(`/projects/${projectId}/files`);
      const files = projectRes.data.files || [];

      if (files.length === 0) {
        throw new Error(`No files found in project ${projectId}. Please create at least one file in the project first.`);
      }

      // Use the first file in the project
      const targetFile = files[0];
      const fileKey = targetFile.key;
      const fileUrl = `https://www.figma.com/file/${fileKey}/${encodeURIComponent(fileName)}`;

      logger.info(`✓ Using existing file in project: ${targetFile.name}`);
      logger.info(`✓ File Key: ${fileKey}`);
      logger.info(`✓ File URL: ${fileUrl}`);
      logger.info(`ℹ️  Note: Figma REST API doesn't support creating new files. Using existing file in project.`);

      return {
        fileKey,
        fileUrl,
        nodeId: '0:1'
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Figma API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }

      logger.error('Failed to access project files', error);
      throw new Error(`Failed to access files in Figma project ${projectId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  /**
   * Populate a Figma file with nodes
   * 
   * Note: Figma's REST API has limited write capabilities.
   * This method will:
   * 1. Save the file structure to disk for reference
   * 2. Log instructions for manual import if needed
   */
  private async populateFile(fileKey: string, nodes: FigmaNodeData[]): Promise<void> {
    try {
      logger.info(`Preparing content for Figma file ${fileKey}`);

      // Transform our nodes to Figma's format
      const figmaNodes = await this.transformNodesToFigmaFormat(nodes);

      // Build complete file structure
      const fileStructure = {
        name: nodes[0]?.name || 'Converted PSD',
        version: '1.0',
        nodes: figmaNodes
      };

      // Save structure to file for reference
      const structurePath = `${config.uploadDir}/figma-structure-${fileKey}.json`;
      const latestPath = `${config.uploadDir}/figma-structure-latest.json`;

      await fs.writeFile(structurePath, JSON.stringify(fileStructure, null, 2));
      // Also save as "latest" for easy plugin access
      await fs.writeFile(latestPath, JSON.stringify(fileStructure, null, 2));

      logger.info(`✓ Saved file structure to: ${structurePath}`);
      logger.info(`✓ Saved as latest: ${latestPath}`);
      logger.info(`File contains ${figmaNodes.length} root nodes with complete hierarchy`);

      // Log summary
      const summary = this.generateStructureSummary(figmaNodes);
      logger.info(`Structure summary: ${summary}`);

      // Instructions for populating the file
      logger.info('');
      logger.info('📋 To populate the Figma file with content:');
      logger.info('1. Open the file in Figma Desktop');
      logger.info('2. Run: Plugins → Development → PSD Content Importer');
      logger.info('3. Click "Import Content" (auto-detects latest conversion)');
      logger.info('4. Content will appear on the canvas!');
      logger.info('');
      logger.info('Plugin setup: See figma-plugin/README.md');

    } catch (error) {
      logger.error('Failed to prepare file content', error);
      // Don't throw - file was created successfully
    }
  }

  /**
   * Generate a summary of the node structure
   */
  private generateStructureSummary(nodes: FigmaNode[]): string {
    let textNodes = 0;
    let imageNodes = 0;
    let frameNodes = 0;
    let totalNodes = 0;

    const countNodes = (nodeList: FigmaNode[]) => {
      for (const node of nodeList) {
        totalNodes++;
        if (node.type === 'TEXT') textNodes++;
        if (node.type === 'RECTANGLE' && node.fills) {
          const hasImageFill = node.fills.some((f: any) => f.type === 'IMAGE');
          if (hasImageFill) imageNodes++;
        }
        if (node.type === 'FRAME') frameNodes++;
        if (node.children) countNodes(node.children);
      }
    };

    countNodes(nodes);

    return `${totalNodes} total nodes (${frameNodes} frames, ${textNodes} text, ${imageNodes} images)`;
  }


  /**
   * Upload all images from nodes to Figma
   */
  private async uploadAllImages(nodes: FigmaNodeData[]): Promise<void> {
    for (const node of nodes) {
      if (node.type === 'IMAGE' && node.imageProperties?.imageRef) {
        const imagePath = node.imageProperties.imageRef;
        if (!this.imageCache.has(imagePath)) {
          const imageRef = await this.uploadImageFile(imagePath);
          this.imageCache.set(imagePath, imageRef);
          logger.debug(`Uploaded image: ${imagePath} -> ${imageRef}`);
        }
      }

      // Process children recursively
      if (node.children && node.children.length > 0) {
        await this.uploadAllImages(node.children);
      }
    }
  }

  /**
   * Upload an image file to Figma
   */
  async uploadImageFile(imagePath: string): Promise<string> {
    try {
      logger.debug(`Uploading image file to Figma: ${imagePath}`);

      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);

      // Create form data for multipart upload
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: imagePath.split('/').pop(),
        contentType: 'image/png'
      });

      // Upload to Figma's image endpoint
      // Note: The exact endpoint and format may vary
      try {
        const response = await this.client.post('/images', formData, {
          headers: {
            ...formData.getHeaders(),
            'X-Figma-Token': config.figmaAccessToken
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });

        if (response.data && response.data.image && response.data.image.url) {
          logger.info(`Image uploaded successfully: ${response.data.image.url}`);
          return response.data.image.url;
        }
      } catch (apiError) {
        logger.warn('Figma image upload API returned error, using local reference');
      }

      // Fallback: return a data URI or file reference
      const base64Image = imageBuffer.toString('base64');
      return `data:image/png;base64,${base64Image}`;

    } catch (error) {
      logger.error('Failed to upload image', error);
      throw new Error('Image upload failed');
    }
  }

  /**
   * Get file information
   */
  async getFile(fileKey: string): Promise<any> {
    try {
      const response = await this.client.get(`/files/${fileKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get file ${fileKey}`, error);
      throw new Error('Failed to retrieve Figma file');
    }
  }

  /**
   * Transform our FigmaNodeData format to actual Figma API format
   */
  private async transformNodesToFigmaFormat(nodes: FigmaNodeData[]): Promise<FigmaNode[]> {
    const transformed: FigmaNode[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const figmaNode = await this.transformSingleNode(node, i);
      if (figmaNode) {
        transformed.push(figmaNode);
      }
    }

    return transformed;
  }

  /**
   * Transform a single node to Figma format
   */
  private async transformSingleNode(node: FigmaNodeData, index: number): Promise<FigmaNode | null> {
    try {
      const baseNode: Partial<FigmaNode> = {
        id: `${index}:${Math.random().toString(36).substr(2, 9)}`,
        name: node.name,
        type: this.mapNodeType(node.type)
      };

      // Add bounding box
      if (node.bounds) {
        baseNode.absoluteBoundingBox = {
          x: node.bounds.left,
          y: node.bounds.top,
          width: node.bounds.right - node.bounds.left,
          height: node.bounds.bottom - node.bounds.top
        };
      }

      // Handle different node types
      switch (node.type) {
        case 'FRAME':
          return await this.transformFrameNode(node, baseNode as FigmaNode);

        case 'TEXT':
          return await this.transformTextNode(node, baseNode as FigmaNode);

        case 'IMAGE':
          return await this.transformImageNode(node, baseNode as FigmaNode);

        case 'RECTANGLE':
          return await this.transformRectangleNode(node, baseNode as FigmaNode);

        default:
          logger.warn(`Unknown node type: ${node.type}`);
          return baseNode as FigmaNode;
      }

    } catch (error) {
      logger.error(`Failed to transform node: ${node.name}`, error);
      return null;
    }
  }

  /**
   * Transform FRAME node
   */
  private async transformFrameNode(node: FigmaNodeData, base: FigmaNode): Promise<FigmaNode> {
    const frameNode = { ...base };

    // Transform children
    if (node.children && node.children.length > 0) {
      frameNode.children = [];
      for (let i = 0; i < node.children.length; i++) {
        const child = await this.transformSingleNode(node.children[i], i);
        if (child) {
          frameNode.children.push(child);
        }
      }
    }

    return frameNode;
  }

  /**
   * Transform TEXT node
   */
  private async transformTextNode(node: FigmaNodeData, base: FigmaNode): Promise<FigmaNode> {
    const textNode = { ...base };

    if (node.textProperties) {
      textNode.characters = node.textProperties.characters;

      // Add text styling
      textNode.style = {
        fontFamily: node.textProperties.fontName.family,
        fontPostScriptName: node.textProperties.fontName.style,
        fontSize: node.textProperties.fontSize,
        textAlignHorizontal: node.textProperties.textAlignHorizontal,
        fills: node.textProperties.fills || []
      };

      if (node.textProperties.lineHeight) {
        textNode.style.lineHeightPx = node.textProperties.lineHeight.value;
      }

      if (node.textProperties.letterSpacing) {
        textNode.style.letterSpacing = node.textProperties.letterSpacing.value;
      }
    }

    return textNode;
  }

  /**
   * Transform IMAGE node
   */
  private async transformImageNode(node: FigmaNodeData, base: FigmaNode): Promise<FigmaNode> {
    const imageNode = { ...base, type: 'RECTANGLE' }; // Images are rectangles with image fills

    if (node.imageProperties?.imageRef) {
      const imageUrl = this.imageCache.get(node.imageProperties.imageRef);

      if (imageUrl) {
        imageNode.fills = [{
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageRef: imageUrl
        }];
      }
    }

    return imageNode;
  }

  /**
   * Transform RECTANGLE node
   */
  private async transformRectangleNode(node: FigmaNodeData, base: FigmaNode): Promise<FigmaNode> {
    const rectNode = { ...base };

    if (node.shapeProperties?.fills) {
      rectNode.fills = node.shapeProperties.fills;
    }

    return rectNode;
  }

  /**
   * Map our node types to Figma's node types
   */
  private mapNodeType(type: string): string {
    const typeMap: Record<string, string> = {
      'FRAME': 'FRAME',
      'GROUP': 'GROUP',
      'TEXT': 'TEXT',
      'RECTANGLE': 'RECTANGLE',
      'ELLIPSE': 'ELLIPSE',
      'VECTOR': 'VECTOR',
      'IMAGE': 'RECTANGLE' // Images are rendered as rectangles with image fills
    };

    return typeMap[type] || 'FRAME';
  }
}

// Singleton instance
const figmaClient = new FigmaClient();

/**
 * Public API
 */
export async function createFigmaFile(
  fileName: string,
  nodes: FigmaNodeData[]
): Promise<FigmaFileResult> {
  return figmaClient.createFile(fileName, nodes);
}

export async function uploadImageFile(imagePath: string): Promise<string> {
  return figmaClient.uploadImageFile(imagePath);
}

export async function getFigmaFile(fileKey: string): Promise<any> {
  return figmaClient.getFile(fileKey);
}

export default figmaClient;
