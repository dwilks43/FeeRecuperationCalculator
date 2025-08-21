import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the DMP logo file as Base64 at startup
const LOGO_PATH = path.resolve(__dirname, '../attached_assets/DMP—Primary Logo—Dynamic—Color_1755095238944.jpg');

let LOGO_DATA_URL: string;

try {
  // Read the logo file and convert to base64
  const logoBuffer = fs.readFileSync(LOGO_PATH);
  const logoB64 = logoBuffer.toString('base64');
  
  // Create data URL for direct embedding
  LOGO_DATA_URL = `data:image/jpeg;base64,${logoB64}`;
  
  console.log(`✅ Logo loaded successfully: ${logoBuffer.length} bytes`);
  console.log(`📏 Base64 length: ${logoB64.length} characters`);
} catch (error) {
  console.error('❌ Failed to load logo file:', error);
  // Fallback to empty data URL if logo fails to load
  LOGO_DATA_URL = '';
}

export { LOGO_DATA_URL };

// Validation function to test logo data
export function validateLogoData(): boolean {
  if (!LOGO_DATA_URL) {
    console.warn('⚠️ Logo data URL is empty');
    return false;
  }
  
  try {
    // Extract base64 portion and validate
    const base64Data = LOGO_DATA_URL.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log(`✅ Logo validation passed: ${buffer.length} bytes decoded`);
    return true;
  } catch (error) {
    console.error('❌ Logo validation failed:', error);
    return false;
  }
}