import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    console.log('Cloudinary multiple upload API called')
    console.log('Environment check:', {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    })
    
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const folder = formData.get('folder') as string || 'loudbrands'

    console.log('Files received:', files.length)
    console.log('Folder:', folder)

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.name}` }, { status: 400 })
      }
      if (file.size > maxSize) {
        return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 })
      }
    }

    // Upload all files to Cloudinary
    console.log('Starting upload process...')
    const uploadPromises = files.map(async (file, index) => {
      console.log(`Uploading file ${index + 1}: ${file.name}`)
      try {
        const imageUrl = await uploadToCloudinary(file, folder)
        console.log(`Successfully uploaded ${file.name}: ${imageUrl}`)
        return {
          url: imageUrl,
          originalName: file.name,
          size: file.size
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        throw error
      }
    })

    const results = await Promise.all(uploadPromises)
    console.log('All uploads completed successfully')

    return NextResponse.json({ 
      success: true, 
      files: results,
      message: 'Images uploaded successfully' 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload images',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
