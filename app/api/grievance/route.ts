import { NextResponse } from 'next/server';
import { z } from 'zod';

const grievanceSchema = z.object({
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
});

export async function POST(request: Request) {
  try {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    const body = await request.json();
    const validatedData = grievanceSchema.parse(body);

    // Here you would typically save the grievance to a database
    // For now, we'll just log it and return a success response
    console.log('Grievance submitted:', {
      requestId,
      location: validatedData.location,
      description: validatedData.description,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      message: 'Grievance submitted successfully',
      requestId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error submitting grievance:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit grievance',
      },
      { status: 500 }
    );
  }
} 