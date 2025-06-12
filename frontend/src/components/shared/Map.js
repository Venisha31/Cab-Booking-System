import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different markers
const createCustomIcon = (iconUrl) => new L.Icon({
  iconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41]
});

const Map = ({ 
  center, 
  markers = [], 
  route = null, 
  zoom = 13, 
  height = '400px',
  driverLocation = null 
}) => {
  const driverIcon = createCustomIcon('/icons/car-icon.png');
  const pickupIcon = createCustomIcon('/icons/pickup-icon.png');
  const dropoffIcon = createCustomIcon('/icons/dropoff-icon.png');

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          icon={marker.type === 'pickup' ? pickupIcon : dropoffIcon}
        >
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}

      {route && (
        <Polyline
          positions={route}
          color="blue"
          weight={3}
          opacity={0.7}
        />
      )}

      {driverLocation && (
        <Marker position={driverLocation.position} icon={driverIcon}>
          <Popup>
            Driver: {driverLocation.driverName}<br />
            Vehicle: {driverLocation.vehicleInfo}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map; 