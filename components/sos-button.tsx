'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function SOSButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };

  const sendSOS = async () => {
    try {
      setIsLoading(true);
      setLocationError(null);

      // Get current location
      const location = await getLocation();
      
      // Get current time
      const timestamp = new Date().toISOString();

      // Send SOS alert
      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SOS alert');
      }

      toast.success('SOS alert sent successfully!', {
        description: 'Your location has been shared with emergency contacts.',
      });
    } catch (error) {
      console.error('SOS Error:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to send SOS alert');
      toast.error('Failed to send SOS alert', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={sendSOS}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <AlertTriangle className="h-5 w-5" />
        {isLoading ? 'Sending SOS...' : 'SOS'}
      </button>
      
      {locationError && (
        <p className="text-sm text-red-500">{locationError}</p>
      )}
    </div>
  );
} 