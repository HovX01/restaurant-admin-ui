'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { getCustomerName, getTotalPrice, parseCustomerDetails } from '@/lib/order-utils';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Dynamically import leaflet and react-leaflet to avoid SSR issues
let L: any;
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;

let defaultIcon: any;
let readyIcon: any;
let outForDeliveryIcon: any;
let completedIcon: any;

if (typeof window !== 'undefined') {
  L = require('leaflet');
  const ReactLeaflet = require('react-leaflet');
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  Marker = ReactLeaflet.Marker;
  Popup = ReactLeaflet.Popup;

  // Fix for default marker icon in Next.js
  defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Custom icons for different delivery statuses
  readyIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  outForDeliveryIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  completedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  L.Marker.prototype.options.icon = defaultIcon;
}

interface DeliveryMapProps {
  orders: Order[];
}

function getMarkerIcon(status: string) {
  switch (status) {
    case 'READY_FOR_DELIVERY':
      return readyIcon;
    case 'OUT_FOR_DELIVERY':
      return outForDeliveryIcon;
    case 'COMPLETED':
      return completedIcon;
    default:
      return defaultIcon;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'READY_FOR_DELIVERY':
      return <Package className="h-3 w-3" />;
    case 'OUT_FOR_DELIVERY':
      return <Truck className="h-3 w-3" />;
    case 'COMPLETED':
      return <CheckCircle className="h-3 w-3" />;
    default:
      return null;
  }
}

export function DeliveryMap({ orders }: DeliveryMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const defaultCenter: [number, number] = [11.5564, 104.9282]; // Phnom Penh, Cambodia
  const defaultZoom = 12;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter orders that have location data
  const ordersWithLocation = orders.filter(
    order => order.latitude && order.longitude
  );

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (ordersWithLocation.length === 0) {
    return (
      <div className="w-full h-[600px] bg-muted rounded-lg flex flex-col items-center justify-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No delivery orders with location data</p>
        <p className="text-sm text-muted-foreground mt-2">Orders need latitude and longitude to appear on the map</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
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
        {ordersWithLocation.map((order) => {
          const customerInfo = parseCustomerDetails(order.customerDetails);
          const customerName = getCustomerName(order);
          const phone = order.customerPhone || customerInfo.phone;
          const address = order.deliveryAddress || order.customerAddress || customerInfo.address;
          const total = getTotalPrice(order);
          
          return (
            <Marker
              key={order.id}
              position={[order.latitude!, order.longitude!]}
              icon={getMarkerIcon(order.status)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Order #{order.id}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>Customer:</strong> {customerName}
                    </div>
                    {phone && (
                      <div>
                        <strong>Phone:</strong> {phone}
                      </div>
                    )}
                    {address && (
                      <div>
                        <strong>Address:</strong> {address}
                      </div>
                    )}
                    {order.assignedDriverName && (
                      <div>
                        <strong>Driver:</strong> {order.assignedDriverName}
                      </div>
                    )}
                    <div className="pt-1 border-t mt-2">
                      <strong>Total:</strong> ${total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-[1000]">
        <div className="text-xs font-semibold mb-2">Order Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Ready for Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Out for Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
