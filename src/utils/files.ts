import path from 'path';
import fs from 'fs-extra';

export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  if (!(await fs.pathExists(dirPath))) return true;
  const files = await fs.readdir(dirPath);
  return files.length === 0;
}

export async function writeFileWithDir(
  filePath: string,
  content: string
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}
