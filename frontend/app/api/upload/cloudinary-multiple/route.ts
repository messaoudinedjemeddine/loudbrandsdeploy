import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const folder = formData.get('folder') as string || 'loudbrands'

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
    const uploadPromises = files.map(async (file) => {
      const imageUrl = await uploadToCloudinary(file, folder)
      return {
        url: imageUrl,
        originalName: file.name,
        size: file.size
      }
    })

    const results = await Promise.all(uploadPromises)

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
