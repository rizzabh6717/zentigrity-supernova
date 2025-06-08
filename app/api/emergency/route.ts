import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { z } from 'zod'
import { sendEmergencyNotifications } from '@/lib/notifications'

// Initialize rate limiters
const requestRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

const validationRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 validation errors per minute
  prefix: 'validation-errors'
});

// Emergency report schema with custom error messages
const emergencySchema = z.object({
  type: z.enum(['medical', 'fire', 'police', 'natural_disaster', 'other'], {
    errorMap: () => ({ message: "Please select a valid emergency type" })
  }),
  location: z.string().min(1, "Please provide the emergency location"),
  description: z.string()
    .min(5, {
      message: "Please provide a brief description of the emergency (minimum 5 characters)."
    })
    .max(500, "Description is too long (maximum 500 characters)")
    .transform(str => str.trim()) // Trim whitespace
    .refine(
      str => {
        // Check if the description contains meaningful content
        const meaningfulWords = str.split(/\s+/).filter(word => word.length > 2).length;
        return meaningfulWords >= 2;
      },
      {
        message: "Please provide at least 2 meaningful words describing the emergency."
      }
    ),
  phone: z.string()
    .min(10, "Please provide a valid phone number (at least 10 digits)")
    .regex(/^[0-9+\-\s()]+$/, "Please provide a valid phone number")
    .transform(str => str.replace(/\s+/g, '')), // Remove whitespace
  timestamp: z.string().datetime()
});

// Performance monitoring utility
function logPerformance(startTime: number, context: string, details?: Record<string, any>) {
  const processingTime = Date.now() - startTime;
  const timestamp = new Date().toISOString();
  
  // Log warning for slow requests (over 2 seconds)
  if (processingTime > 2000) {
    console.warn(`[${timestamp}] Slow Request Detected - ${context}:`, {
      processingTime: `${processingTime}ms`,
      ...details
    });
  }

  // Log all performance metrics
  console.log(`[${timestamp}] Performance Metrics - ${context}:`, {
    processingTime: `${processingTime}ms`,
    ...details
  });
}

// Error logging utility
function logError(error: unknown, context: string, startTime?: number, additionalContext?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const logData: Record<string, any> = {
    timestamp
  };

  if (startTime) {
    logData.processingTime = `${Date.now() - startTime}ms`;
  }

  if (additionalContext) {
    Object.assign(logData, additionalContext);
  }
  
  if (error instanceof z.ZodError) {
    // For validation errors, only log the relevant validation details
    logData.type = 'Validation Error';
    logData.errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    console.error(`[${timestamp}] Emergency API Error - ${context}:`, logData);
  } else {
    // For other errors, log a simplified version
    logData.type = 'Server Error';
    if (error instanceof Error) {
      logData.error = {
        message: error.message,
        name: error.name
      };
      if (error.cause) {
        logData.error.cause = String(error.cause);
      }
    } else {
      logData.error = { message: String(error) };
    }
    console.error(`[${timestamp}] Emergency API Error - ${context}:`, logData);
  }
}

// Format validation errors for client
function formatValidationErrors(error: z.ZodError) {
  return error.errors.map(err => {
    const field = err.path.join('.');
    let message = err.message;
    
    // Customize error messages based on field
    if (field === 'description') {
      if (err.code === 'too_small') {
        message = "Please provide a brief description of the emergency (minimum 5 characters).";
      } else if (err.code === 'custom') {
        message = "Please provide at least 2 meaningful words describing the emergency.";
      }
    }
    
    return {
      field,
      message,
      code: err.code
    };
  });
}

export async function POST(req: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const contentType = req.headers.get('content-type') || 'unknown';
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    // Check general rate limit
    const { success: requestSuccess, limit, reset, remaining } = await requestRatelimit.limit(ip);

    if (!requestSuccess) {
      logError('Rate limit exceeded', 'Rate Limiting', startTime, {
        requestId,
        ip,
        userAgent,
        remaining,
        limit
      });
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
          remaining,
          limit
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body = await req.json();
    
    // Pre-process the description field
    if (body.description) {
      body.description = body.description.trim();
    }
    
    // Validate request body
    let validatedData;
    try {
      validatedData = emergencySchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Check validation error rate limit
        const { success: validationSuccess } = await validationRatelimit.limit(ip);
        
        if (!validationSuccess) {
          logError('Validation error rate limit exceeded', 'Validation Rate Limiting', startTime, {
            requestId,
            ip,
            userAgent
          });
          return NextResponse.json(
            { 
              error: 'Too many validation errors. Please review the form carefully.',
              retryAfter: 60
            },
            { status: 429 }
          );
        }

        logError(error, 'Validation Error', startTime, {
          requestId,
          userAgent,
          contentType,
          requestBody: req.body ? 'present' : 'missing',
          ip,
          remaining: remaining - 1,
          descriptionLength: body.description?.length || 0,
          descriptionWords: body.description?.split(/\s+/).length || 0
        });
        return NextResponse.json(
          { 
            error: 'Invalid request data',
            details: formatValidationErrors(error),
            processingTime: `${Date.now() - startTime}ms`,
            descriptionLength: body.description?.length || 0,
            descriptionWords: body.description?.split(/\s+/).length || 0
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Create emergency report
    const report = {
      type: validatedData.type,
      location: validatedData.location,
      description: validatedData.description,
      phone: validatedData.phone,
      timestamp: new Date().toISOString()
    };

    // Send notifications
    const notificationResult = await sendEmergencyNotifications(report);

    if (!notificationResult.success) {
      logError(notificationResult.error, 'Notification Failure', startTime, {
        requestId,
        reportType: report.type,
        location: report.location
      });
      // Continue with the response even if notifications fail
    }

    logPerformance(startTime, 'Emergency Report Processing', {
      requestId,
      reportType: report.type,
      location: report.location,
      notificationStatus: notificationResult.success ? 'success' : 'failed',
      userAgent,
      contentType,
      ip,
      remaining: remaining - 1
    });

    return NextResponse.json({
      success: true,
      message: 'Emergency report submitted successfully',
      report,
      processingTime: `${Date.now() - startTime}ms`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // This should never happen as we catch ZodErrors above
      logError(error, 'Validation Error', startTime, {
        requestId,
        userAgent,
        contentType,
        ip
      });
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: formatValidationErrors(error),
          processingTime: `${Date.now() - startTime}ms`
        },
        { status: 400 }
      );
    }

    logError(error, 'Server Error', startTime, {
      requestId,
      userAgent,
      contentType,
      ip
    });
    return NextResponse.json(
      { 
        error: 'Failed to process emergency report',
        processingTime: `${Date.now() - startTime}ms`
      },
      { status: 500 }
    );
  }
} 