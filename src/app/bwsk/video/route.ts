import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function GET() {
  try {
    const videoPath = path.join(process.cwd(), 'src/app/the-bachelor/video-bwks-1.mp4')
    const videoBuffer = await readFile(videoPath)
    const body = new Uint8Array(videoBuffer)

    return new Response(body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response('Video not found', { status: 404 })
  }
}
