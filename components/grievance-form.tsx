'use client';

import { useState } from 'react';
import LocationPicker from './location-picker';
import { toast } from 'sonner';

export default function GrievanceForm() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation([lat, lng]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast.error('Please select a location on the map');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/grievance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            latitude: location[0],
            longitude: location[1],
          },
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit grievance');
      }

      toast.success('Grievance submitted successfully');
      setDescription('');
      setLocation(null);
    } catch (error) {
      toast.error('Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialPosition={location}
        />
        {location && (
          <p className="mt-2 text-sm text-gray-500">
            Selected location: {location[0].toFixed(6)}, {location[1].toFixed(6)}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Describe your grievance..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
      </button>
    </form>
  );
} 