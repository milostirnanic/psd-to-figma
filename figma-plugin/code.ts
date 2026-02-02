/**
 * Figma Plugin: PSD Content Importer
 * 
 * This plugin fetches converted PSD data from the backend
 * and creates nodes in the Figma file
 */

// Show UI
figma.showUI(__html__, { width: 400, height: 300 });

// Listen for messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import-nodes') {
    try {
      const { nodes, fileName } = msg.data;
      
      console.log(`Importing ${nodes.length} root nodes from: ${fileName}`);
      
      // Create root frame
      const rootFrame = figma.createFrame();
      rootFrame.name = fileName || 'Converted PSD';
      rootFrame.resize(800, 600); // Default size, will be adjusted
      
      // Import nodes recursively
      await importNodes(nodes, rootFrame);
      
      // Adjust frame to fit content
      rootFrame.resize(
        Math.max(800, rootFrame.width),
        Math.max(600, rootFrame.height)
      );
      
      // Select and zoom to the imported content
      figma.currentPage.selection = [rootFrame];
      figma.viewport.scrollAndZoomIntoView([rootFrame]);
      
      figma.ui.postMessage({ 
        type: 'import-complete', 
        success: true,
        message: `Imported ${fileName} successfully!`
      });
      
      console.log('Import complete!');
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      figma.ui.postMessage({ 
        type: 'import-complete', 
        success: false,
        message: `Error: ${errorMessage}`
      });
    }
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

/**
 * Import nodes recursively
 */
async function importNodes(nodes: any[], parent: FrameNode | PageNode): Promise<void> {
  for (const nodeData of nodes) {
    try {
      const node = await createNode(nodeData, parent);
      
      // Import children recursively
      if (nodeData.children && nodeData.children.length > 0 && 'children' in node) {
        await importNodes(nodeData.children, node as FrameNode);
      }
    } catch (error) {
      console.error(`Failed to create node: ${nodeData.name}`, error);
    }
  }
}

/**
 * Create a single node based on type
 */
async function createNode(nodeData: any, parent: FrameNode | PageNode): Promise<SceneNode> {
  console.log(`Creating ${nodeData.type}: ${nodeData.name}`);
  
  let node: SceneNode;
  
  switch (nodeData.type) {
    case 'FRAME':
      node = createFrameNode(nodeData, parent);
      break;
      
    case 'TEXT':
      node = await createTextNode(nodeData, parent);
      break;
      
    case 'RECTANGLE':
    case 'IMAGE':
      node = await createRectangleNode(nodeData, parent);
      break;
      
    default:
      console.warn(`Unknown node type: ${nodeData.type}`);
      node = createFrameNode(nodeData, parent);
  }
  
  return node;
}

/**
 * Create FRAME node
 */
function createFrameNode(nodeData: any, parent: FrameNode | PageNode): FrameNode {
  const frame = figma.createFrame();
  frame.name = nodeData.name || 'Frame';
  
  if (nodeData.absoluteBoundingBox) {
    frame.x = nodeData.absoluteBoundingBox.x;
    frame.y = nodeData.absoluteBoundingBox.y;
    frame.resize(
      nodeData.absoluteBoundingBox.width,
      nodeData.absoluteBoundingBox.height
    );
  }
  
  frame.opacity = nodeData.opacity ?? 1;
  parent.appendChild(frame);
  
  return frame;
}

/**
 * Create TEXT node
 */
async function createTextNode(nodeData: any, parent: FrameNode | PageNode): Promise<TextNode> {
  const text = figma.createText();
  text.name = nodeData.name || 'Text';
  
  // Load font first
  const fontFamily = nodeData.style?.fontFamily || 'Inter';
  const fontStyle = nodeData.style?.fontPostScriptName || 'Regular';
  
  try {
    await figma.loadFontAsync({ family: fontFamily, style: fontStyle });
  } catch {
    // Fallback to Inter Regular
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  }
  
  // Set text content
  text.characters = nodeData.characters || '';
  
  // Set position and size
  if (nodeData.absoluteBoundingBox) {
    text.x = nodeData.absoluteBoundingBox.x;
    text.y = nodeData.absoluteBoundingBox.y;
    if (nodeData.absoluteBoundingBox.width > 0) {
      text.resize(nodeData.absoluteBoundingBox.width, text.height);
    }
  }
  
  // Set font properties
  if (nodeData.style) {
    if (nodeData.style.fontSize) {
      text.fontSize = nodeData.style.fontSize;
    }
    if (nodeData.style.textAlignHorizontal) {
      text.textAlignHorizontal = nodeData.style.textAlignHorizontal;
    }
    if (nodeData.style.fills && Array.isArray(nodeData.style.fills)) {
      text.fills = nodeData.style.fills.map(convertFill);
    }
  }
  
  text.opacity = nodeData.opacity ?? 1;
  parent.appendChild(text);
  
  return text;
}

/**
 * Create RECTANGLE node (for shapes and images)
 */
async function createRectangleNode(nodeData: any, parent: FrameNode | PageNode): Promise<RectangleNode> {
  const rect = figma.createRectangle();
  rect.name = nodeData.name || 'Rectangle';
  
  if (nodeData.absoluteBoundingBox) {
    rect.x = nodeData.absoluteBoundingBox.x;
    rect.y = nodeData.absoluteBoundingBox.y;
    rect.resize(
      nodeData.absoluteBoundingBox.width,
      nodeData.absoluteBoundingBox.height
    );
  }
  
  // Handle fills (including image fills)
  if (nodeData.fills && Array.isArray(nodeData.fills)) {
    try {
      rect.fills = nodeData.fills.map(convertFill);
    } catch (error) {
      console.warn('Failed to apply fills:', error);
      // Fallback to gray fill
      rect.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
    }
  }
  
  rect.opacity = nodeData.opacity ?? 1;
  parent.appendChild(rect);
  
  return rect;
}

/**
 * Convert fill data to Figma fill format
 */
function convertFill(fillData: any): Paint {
  if (fillData.type === 'SOLID') {
    return {
      type: 'SOLID',
      color: fillData.color || { r: 0, g: 0, b: 0 },
      opacity: fillData.opacity ?? 1
    };
  } else if (fillData.type === 'IMAGE') {
    // For images, we need to handle base64 or URL
    // Note: Figma requires images to be uploaded first
    // For now, we'll use a placeholder
    console.warn('Image fills require manual upload. Using placeholder.');
    return {
      type: 'SOLID',
      color: { r: 0.9, g: 0.9, b: 0.9 }
    };
  }
  
  // Default fallback
  return {
    type: 'SOLID',
    color: { r: 0, g: 0, b: 0 }
  };
}
