// Client-side image compression using Canvas API

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputFormat?: 'jpeg' | 'webp'
}

export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    outputFormat = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Calculate new dimensions
      let { width, height } = img
      
      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        
        if (width > height) {
          width = Math.min(width, maxWidth)
          height = width / aspectRatio
        } else {
          height = Math.min(height, maxHeight)
          width = height * aspectRatio
        }
      }

      // Set canvas size
      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'))
          return
        }

        // Create new file with compressed data
        const compressedFile = new File(
          [blob], 
          `compressed-${Date.now()}.${outputFormat}`, 
          {
            type: `image/${outputFormat}`,
            lastModified: Date.now()
          }
        )

        console.log('Image compressed:', {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          reduction: Math.round((1 - compressedFile.size / file.size) * 100) + '%',
          dimensions: `${width}x${height}`
        })

        resolve(compressedFile)
      }, `image/${outputFormat}`, quality)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Helper function to determine if compression is needed
export function shouldCompress(file: File): boolean {
  const maxSize = 500 * 1024 // 500KB threshold
  return file.size > maxSize || !file.type.includes('jpeg')
}