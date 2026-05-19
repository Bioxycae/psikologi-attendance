"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

import L from "leaflet";

const markerIcon =
   new L.Icon({
      iconUrl:
         "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

      shadowUrl:
         "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

      iconSize: [25, 41],

      iconAnchor: [12, 41],
   });

type MapPickerProps = {
   latitude: number;
   longitude: number;

   onChange: ({
      latitude,
      longitude,
   }: {
      latitude: number;
      longitude: number;
   }) => void;
};

type LocationMarkerProps = {
   latitude: number;
   longitude: number;

   onChange: ({
      latitude,
      longitude,
   }: {
      latitude: number;
      longitude: number;
   }) => void;
};

const LocationMarker = ({
   latitude,
   longitude,
   onChange,
}: LocationMarkerProps) => {
   useMapEvents({
      click(event) {
         onChange({
            latitude:
               event.latlng.lat,

            longitude:
               event.latlng.lng,
         });
      },
   });

   return (
      <Marker
         position={[
            latitude,
            longitude,
         ]}
         icon={markerIcon}
      />
   );
};

export const MapPicker = ({
   latitude,
   longitude,
   onChange,
}: MapPickerProps) => {
   return (
      <div className="overflow-hidden rounded-3xl border border-(--ketiga)">
         <MapContainer
            center={[
               latitude,
               longitude,
            ]}
            zoom={17}
            scrollWheelZoom
            className="h-100 w-full"
         >
            <TileLayer
               attribution='&copy; OpenStreetMap contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker
               latitude={latitude}
               longitude={longitude}
               onChange={onChange}
            />
         </MapContainer>
      </div>
   );
};