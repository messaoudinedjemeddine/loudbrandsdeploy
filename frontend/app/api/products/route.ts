import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://loudbrands-backend-eu-abfa65dd1df6.herokuapp.com'
    const timestamp = Date.now()
    
    // Build the backend URL with brand parameter if provided
    const backendUrlWithParams = brand 
      ? `${backendUrl}/api/products?brand=${brand}&_t=${timestamp}`
      : `${backendUrl}/api/products?_t=${timestamp}`
    
    const response = await fetch(backendUrlWithParams, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 