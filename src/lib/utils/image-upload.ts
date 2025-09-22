import { put } from '@vercel/blob'

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
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File size must be less than 10MB')
  }
  
  try {
    // Get file extension from original file
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${userId}/${Date.now()}.${fileExtension}`
    
    console.log('Uploading original image to Vercel Blob:', fileName)
    
    // Use multipart upload for larger files (>1MB)
    const useMultipart = file.size > 1024 * 1024 // 1MB threshold
    
    const { url } = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
      multipart: useMultipart, // Enable multipart for large files
      addRandomSuffix: true // Avoid filename conflicts
    })
    
    console.log(`Upload successful with ${useMultipart ? 'multipart' : 'standard'} method:`, url)
    return url
  } catch (error) {
    console.error('Image upload failed:', error)
    throw error
  }
}