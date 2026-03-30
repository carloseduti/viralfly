import { spawn } from 'node:child_process';
import ffmpegStatic from 'ffmpeg-static';

import { env } from '@/lib/env';

export class FfmpegExecutor {
  run(args: string[]) {
    const ffmpegBinary = env.FFMPEG_PATH ?? ffmpegStatic ?? 'ffmpeg';

    return new Promise<void>((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegBinary, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      ffmpegProcess.stderr.on('data', (chunk) => {
        stderr += String(chunk);
      });

      ffmpegProcess.on('error', (err) => {
        reject(new Error(`Falha ao iniciar ffmpeg (${ffmpegBinary}): ${err.message}`));
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
