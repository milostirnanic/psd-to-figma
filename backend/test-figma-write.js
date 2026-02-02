/**
 * Test Figma API write capabilities
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testFigmaWriteAPI() {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  const projectId = process.env.FIGMA_PROJECT_ID;

  console.log('=== Testing Figma Write API ===\n');

  try {
    // Get existing file in project
    const projectRes = await axios.get(
      `https://api.figma.com/v1/projects/${projectId}/files`,
      { headers: { 'X-Figma-Token': token } }
    );

    const file = projectRes.data.files[0];
    const fileKey = file.key;

    console.log(`Testing with file: ${file.name} (${fileKey})\n`);

    // Test 1: Check if there's a nodes endpoint
    console.log('Test 1: Checking for nodes write endpoint...');
    try {
      const nodesRes = await axios.post(
        `https://api.figma.com/v1/files/${fileKey}/nodes`,
        {
          nodes: [{
            type: 'FRAME',
            name: 'Test Frame',
            width: 100,
            height: 100
          }]
        },
        { headers: { 'X-Figma-Token': token } }
      );
      console.log('✅ Nodes endpoint exists!');
      console.log('Response:', JSON.stringify(nodesRes.data, null, 2));
    } catch (error) {
      console.log(`❌ Nodes endpoint: ${error.response?.status || error.message}`);
    }

    // Test 2: Check for paste/import endpoint
    console.log('\nTest 2: Checking for paste/import endpoint...');
    try {
      const pasteRes = await axios.post(
        `https://api.figma.com/v1/files/${fileKey}/paste`,
        {
          data: JSON.stringify({
            type: 'FRAME',
            name: 'Test Frame'
          })
        },
        { headers: { 'X-Figma-Token': token } }
      );
      console.log('✅ Paste endpoint exists!');
      console.log('Response:', JSON.stringify(pasteRes.data, null, 2));
    } catch (error) {
      console.log(`❌ Paste endpoint: ${error.response?.status || error.message}`);
    }

    // Test 3: Check if we can update file content via PUT
    console.log('\nTest 3: Checking for file update endpoint...');
    try {
      const updateRes = await axios.put(
        `https://api.figma.com/v1/files/${fileKey}`,
        {
          document: {
            type: 'DOCUMENT',
            children: [{
              type: 'CANVAS',
              name: 'Page 1',
              children: [{
                type: 'FRAME',
                name: 'Test Frame',
                width: 100,
                height: 100
              }]
            }]
          }
        },
        { headers: { 'X-Figma-Token': token } }
      );
      console.log('✅ File update endpoint exists!');
      console.log('Response:', JSON.stringify(updateRes.data, null, 2));
    } catch (error) {
      console.log(`❌ File update endpoint: ${error.response?.status || error.message}`);
    }

    // Test 4: Check for comments endpoint (this one we know works)
    console.log('\nTest 4: Checking comments endpoint (known to work)...');
    try {
      const commentsRes = await axios.post(
        `https://api.figma.com/v1/files/${fileKey}/comments`,
        {
          message: 'Test comment from API',
          client_meta: { x: 0, y: 0 }
        },
        { headers: { 'X-Figma-Token': token } }
      );
      console.log('✅ Comments work (can write to file)');
      console.log('Comment ID:', commentsRes.data.id);

      // Clean up - delete the comment
      await axios.delete(
        `https://api.figma.com/v1/files/${fileKey}/comments/${commentsRes.data.id}`,
        { headers: { 'X-Figma-Token': token } }
      );
      console.log('✓ Test comment deleted');
    } catch (error) {
      console.log(`❌ Comments: ${error.response?.status || error.message}`);
    }

    console.log('\n=== Summary ===');
    console.log('Figma REST API has very limited write capabilities.');
    console.log('To add nodes to files, you need:');
    console.log('  1. Figma Plugin API (runs in Figma Desktop)');
    console.log('  2. Figma Desktop app with plugin development');
    console.log('  3. Or use Figma\'s import/paste features\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFigmaWriteAPI();
