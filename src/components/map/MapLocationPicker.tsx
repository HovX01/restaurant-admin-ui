'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import leaflet and react-leaflet to avoid SSR issues
let L: any;
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let useMapEvents: any;

if (typeof window !== 'undefined') {
  L = require('leaflet');
  const ReactLeaflet = require('react-leaflet');
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  Marker = ReactLeaflet.Marker;
  useMapEvents = ReactLeaflet.useMapEvents;
  
  require('leaflet/dist/leaflet.css');

  // Fix for default marker icon in Next.js
  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  L.Marker.prototype.options.icon = defaultIcon;
}

interface MapLocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<any>(null);

  if (typeof window !== 'undefined' && useMapEvents) {
    useMapEvents({
      click(e: any) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
  }

  return position === null ? null : <Marker position={position} />;
}

export function MapLocationPicker({ latitude, longitude, onLocationSelect }: MapLocationPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const defaultCenter: [number, number] = [latitude || 11.5564, longitude || 104.9282]; // Default to Phnom Penh, Cambodia
  const defaultZoom = 13;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
        {latitude && longitude && <Marker position={[latitude, longitude]} />}
      </MapContainer>
    </div>
  );
}
