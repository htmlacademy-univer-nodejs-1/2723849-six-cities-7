import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export class TSVFileReader {
  async *read(filename: string): AsyncGenerator<string[]> {
    const stream = createReadStream(filename, { encoding: 'utf8' });
    const lines = createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    try {
      for await (const line of lines) {
        if (line.length === 0) {
          continue;
        }

        yield line.replace(/^\uFEFF/, '').split('\t');
      }
    } finally {
      lines.close();
      stream.destroy();
    }
  }
}
