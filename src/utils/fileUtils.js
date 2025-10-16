import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function ensureTempDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const tempDir = path.join(__dirname, '../../temp');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  return tempDir;
}
