import { readFile } from 'node:fs/promises';

export class TSVFileReader {
  async read(filename: string): Promise<string[][]> {
    const content = await readFile(filename, 'utf-8');
    return content
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .map((line) => line.split('\t'));
  }
}
