import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { z } from 'zod';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// SOS request schema
const sosSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string().datetime()
});

export async function POST(req: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = sosSchema.parse(body);

    // Get Google Maps link
    const mapsLink = `https://www.google.com/maps?q=${validatedData.latitude},${validatedData.longitude}`;

    // Send email notification
    const msg = {
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'emergency@example.com',
      subject: '🚨 SOS Alert - Immediate Assistance Required',
      text: `SOS Alert\nLocation: ${mapsLink}\nTime: ${new Date(validatedData.timestamp).toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">🚨 SOS Alert</h2>
          <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px;">
            <p><strong>Location:</strong> <a href="${mapsLink}" target="_blank">View on Google Maps</a></p>
            <p><strong>Coordinates:</strong> ${validatedData.latitude}, ${validatedData.longitude}</p>
            <p><strong>Time:</strong> ${new Date(validatedData.timestamp).toLocaleString()}</p>
          </div>
          <p style="margin-top: 20px; color: #666;">
            This is an automated SOS alert. Immediate assistance is required.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);

    const processingTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] SOS Alert Sent:`, {
      requestId,
      processingTime: `${processingTime}ms`,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude
    });

    return NextResponse.json({
      success: true,
      message: 'SOS alert sent successfully',
      processingTime: `${processingTime}ms`
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] SOS Error:`, {
      requestId,
      error,
      processingTime: `${processingTime}ms`
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to send SOS alert',
        processingTime: `${processingTime}ms`
      },
      { status: 500 }
    );
  }
} 