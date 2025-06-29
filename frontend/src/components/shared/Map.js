import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons (optional fallback)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ✅ Custom online icons (no need to store locally)
const pickupIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// ✅ Auto-zoom to fit all markers
const AutoFitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
};

const Map = ({
  center,
  markers = [],
  route = null,
  zoom = 13,
  height = '400px',
  driverLocation = null
}) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />

      <AutoFitBounds markers={markers} />

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
