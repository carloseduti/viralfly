import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { FfmpegExecutor } from '@/server/ffmpeg/ffmpeg-executor';

const MOCK_VIDEO_MARKER = 'MOCK_VIDEO_CONTENT:';

export class VideoAssemblerService {
  constructor(private readonly ffmpeg = new FfmpegExecutor()) {}

  async assembleClips(clips: Buffer[]) {
    const tempBase = path.join(os.tmpdir(), `viralfly-${Date.now()}`);
    await mkdir(tempBase, { recursive: true });

    const outputVideoPath = path.join(tempBase, 'final-video.mp4');
    const thumbnailPath = path.join(tempBase, 'thumb.jpg');

    if (isMockClipCollection(clips)) {
      await this.ffmpeg.run([
        '-y',
        '-f',
        'lavfi',
        '-i',
        `color=c=#111827:s=720x1280:d=${clips.length * 8}`,
        '-r',
        '30',
        '-pix_fmt',
        'yuv420p',
        outputVideoPath
      ]);
    } else {
      const clipPaths = await Promise.all(
        clips.map(async (clip, idx) => {
          const clipPath = path.join(tempBase, `clip-${idx + 1}.mp4`);
          await writeFile(clipPath, clip);
          return clipPath;
        })
      );

      const concatListPath = path.join(tempBase, 'concat-list.txt');
      const concatContent = clipPaths.map((clipPath) => `file '${clipPath.replace(/'/g, "'\\''")}'`).join('\n');
      await writeFile(concatListPath, concatContent, 'utf-8');

      await this.ffmpeg.run([
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        concatListPath,
        '-c',
        'copy',
        outputVideoPath
      ]);
    }

    await this.ffmpeg.run(['-y', '-i', outputVideoPath, '-ss', '00:00:01', '-vframes', '1', thumbnailPath]);

    return {
      outputVideoPath,
      thumbnailPath,
      estimatedDurationSeconds: clips.length * 8
    };
  }
}

function isMockClipCollection(clips: Buffer[]) {
  return clips.every((clip) => clip.toString('utf-8', 0, MOCK_VIDEO_MARKER.length) === MOCK_VIDEO_MARKER);
}
