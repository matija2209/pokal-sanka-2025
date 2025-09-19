import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function uploadImage(
  file: File, 
  folder: string, 
  userId: string
): Promise<string> {
  console.log('uploadImage called with:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    folder,
    userId
  })

  console.log('Vercel Blob token available:', !!process.env.BLOB_READ_WRITE_TOKEN)

  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit (increased since we'll compress)
    throw new Error('File size must be less than 10MB')
  }
  
  try {
    // Convert File to Buffer for Sharp processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('Original image size:', file.size, 'bytes')
    
    // Determine compression settings based on original file size
    const isLargeFile = file.size > 3 * 1024 * 1024 // 3MB+
    const maxWidth = isLargeFile ? 1200 : 1920
    const maxHeight = isLargeFile ? 800 : 1080
    const quality = isLargeFile ? 75 : 85
    
    // Compress and optimize image with Sharp
    const compressedBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, { // Adaptive dimensions based on file size
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ // Convert all images to JPEG for consistency
        quality, // Adaptive quality: 75% for large files, 85% for smaller
        progressive: true,
        mozjpeg: true // Use mozjpeg encoder for better compression
      })
      .toBuffer()
    
    console.log('Compressed image size:', compressedBuffer.length, 'bytes', 
                `(${Math.round((1 - compressedBuffer.length / file.size) * 100)}% reduction)`)
    
    // Upload compressed image to Vercel Blob
    const fileName = `${folder}/${userId}/${Date.now()}.jpg` // Always use .jpg extension
    
    console.log('Uploading compressed image to Vercel Blob:', fileName)
    
    // Use multipart upload for larger files (>1MB after compression)
    const useMultipart = compressedBuffer.length > 1024 * 1024 // 1MB threshold
    
    const { url } = await put(fileName, compressedBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
      multipart: useMultipart, // Enable multipart for large files
      addRandomSuffix: true // Avoid filename conflicts
    })
    
    console.log(`Upload successful with ${useMultipart ? 'multipart' : 'standard'} method:`, url)
    return url
  } catch (error) {
    console.error('Image processing/upload failed:', error)
    throw error
  }
}