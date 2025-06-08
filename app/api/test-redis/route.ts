import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function GET() {
  try {
    // Test Redis connection
    await redis.set('test', 'Redis connection successful')
    const value = await redis.get('test')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Redis connection test successful',
      value 
    })
  } catch (error) {
    console.error('Redis connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to Redis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 