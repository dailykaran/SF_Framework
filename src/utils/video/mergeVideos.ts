import { spawnSync } from 'child_process';
import * as fs from 'fs';

export interface RecordedVideo {
  role: string;
  file: string;
  /** Epoch ms when the recording context was created; used to align the clips on one timeline. */
  startedAt: number;
}

/**
 * Locates a full ffmpeg build. Playwright's bundled ffmpeg is a stripped-down build
 * without the hstack filter, so it cannot be used for merging.
 * Order: FFMPEG_PATH env, the `ffmpeg-static` package, then `ffmpeg` on PATH.
 */
export function findFfmpeg(): string | undefined {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;

  try {
    const bundled: string | null = require('ffmpeg-static');
    if (bundled && fs.existsSync(bundled)) return bundled;
  } catch {
    // package not installed; fall through to PATH
  }

  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return probe.status === 0 ? 'ffmpeg' : undefined;
}
/**
 * Combines the clips of every role used in one test into a single side-by-side .webm.
 * Clips are aligned by their start time. Returns true when the output file was written.
 */
export function mergeVideos(videos: RecordedVideo[], output: string, height = 720): boolean {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg || videos.length < 2) return false;

  const origin = Math.min(...videos.map(v => v.startedAt));
  const args: string[] = ['-y'];
  for (const v of videos) {
    args.push('-itsoffset', ((v.startedAt - origin) / 1000).toFixed(3), '-i', v.file);
  }
  const scaled = videos.map((_, i) => `[${i}:v]scale=-2:${height},setsar=1[v${i}]`).join(';');
  const stacked = videos.map((_, i) => `[v${i}]`).join('') + `hstack=inputs=${videos.length}[out]`;
  args.push('-filter_complex', `${scaled};${stacked}`, '-map', '[out]', '-c:v', 'libvpx', '-b:v', '1M', '-an', output);

  const result = spawnSync(ffmpeg, args, { stdio: 'pipe' });
  return result.status === 0 && fs.existsSync(output);
}
