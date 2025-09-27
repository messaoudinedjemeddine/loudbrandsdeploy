import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'

export async function GET() {
  try {
    // Test Cloudinary connection
    const result = await cloudinary.api.ping()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cloudinary connection successful',
      result: result
    })
  } catch (error) {
    console.error('Cloudinary test error:', error)
    return NextResponse.json({ 
      error: 'Cloudinary connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
