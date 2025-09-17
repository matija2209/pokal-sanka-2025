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
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File size must be less than 5MB')
  }
  
  // Upload to Vercel Blob with organized structure
  const fileExtension = file.type.split('/')[1]
  const fileName = `${folder}/${userId}/${Date.now()}.${fileExtension}`
  
  console.log('Uploading to Vercel Blob:', fileName)
  
  try {
    const { url } = await put(fileName, file, {
      access: 'public'
    })
    
    console.log('Upload successful:', url)
    return url
  } catch (error) {
    console.error('Vercel Blob upload failed:', error)
    throw error
  }
}