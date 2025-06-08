'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
}

function LocationMarker({ onLocationSelect, initialPosition }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition || null
  );

  const map = useMapEvents({
    click(e) {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onLocationSelect(newPosition[0], newPosition[1]);
    },
  });

  // If initialPosition is provided, center the map on it
  useEffect(() => {
    if (initialPosition) {
      map.setView(initialPosition, 15);
    }
  }, [initialPosition, map]);

  return position ? <Marker position={position} icon={icon} /> : null;
}

export default function LocationPicker({ onLocationSelect, initialPosition }: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(initialPosition || null);

  useEffect(() => {
    setIsClient(true);
    if (!initialPosition) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setUserPosition(coords);
            onLocationSelect(coords[0], coords[1]);
          },
          () => {
            // If denied, fallback to default (Delhi)
            setUserPosition([28.6139, 77.2090]);
            onLocationSelect(28.6139, 77.2090);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setUserPosition([28.6139, 77.2090]);
        onLocationSelect(28.6139, 77.2090);
      }
    }
  }, [initialPosition, onLocationSelect]);

  if (!isClient) {
    return <div className="h-[400px] bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={userPosition || [28.6139, 77.2090]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          onLocationSelect={onLocationSelect}
          initialPosition={userPosition || initialPosition}
        />
      </MapContainer>
    </div>
  );
} 