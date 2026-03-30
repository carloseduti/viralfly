import { spawn } from 'node:child_process';

import { env } from '@/lib/env';

export class FfmpegExecutor {
  run(args: string[]) {
    return new Promise<void>((resolve, reject) => {
      const ffmpegProcess = spawn(env.FFMPEG_PATH, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      ffmpegProcess.stderr.on('data', (chunk) => {
        stderr += String(chunk);
      });

      ffmpegProcess.on('error', (err) => {
        reject(new Error(`Falha ao iniciar ffmpeg: ${err.message}`));
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`ffmpeg retornou código ${code}: ${stderr}`));
      });
    });
  }
}
