const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v', '.ogg']

export function isVideoMimeType(value?: string | null): boolean {
  return typeof value === 'string' && value.startsWith('video/')
}

export function isImageMimeType(value?: string | null): boolean {
  return typeof value === 'string' && value.startsWith('image/')
}

export function isVideoUrl(value?: string | null): boolean {
  if (typeof value !== 'string' || value.length === 0) {
    return false
  }

  const normalizedValue = value.toLowerCase().split('?')[0]
  return VIDEO_EXTENSIONS.some((extension) => normalizedValue.endsWith(extension))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
