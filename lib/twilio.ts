import twilio from 'twilio';

// Validate required environment variables
const requiredEnvVars = {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
};

// Check if all required environment variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required Twilio environment variables:', missingVars);
  throw new Error(`Missing required Twilio environment variables: ${missingVars.join(', ')}`);
}

// Initialize Twilio client
export const twilioClient = twilio(
  requiredEnvVars.TWILIO_ACCOUNT_SID!,
  requiredEnvVars.TWILIO_AUTH_TOKEN!
);

// Validate Twilio phone number format
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Remove all non-digit characters
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  // Check if the number is valid (between 10 and 15 digits)
  return cleanedNumber.length >= 10 && cleanedNumber.length <= 15;
}

// Get the configured Twilio phone number
export function getTwilioPhoneNumber(): string {
  const phoneNumber = requiredEnvVars.TWILIO_PHONE_NUMBER!;
  if (!validatePhoneNumber(phoneNumber)) {
    throw new Error('Invalid Twilio phone number format');
  }
  return phoneNumber;
} 