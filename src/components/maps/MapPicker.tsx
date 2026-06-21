"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";

const SearchControl = ({ onChange }: { onChange: ({ latitude, longitude }: { latitude: number, longitude: number }) => void }) => {
   const map = useMap();
   useEffect(() => {
      const provider = new OpenStreetMapProvider();
      // @ts-ignore
      const searchControl = new GeoSearchControl({
         provider: provider,
         style: "bar",
         showMarker: false,
         showPopup: false,
         autoClose: true,
         searchLabel: "Cari lokasi...",
      });

      map.addControl(searchControl);
      
      map.on("geosearch/showlocation", (result: any) => {
         if (result && result.location) {
            onChange({
               latitude: result.location.y,
               longitude: result.location.x,
            });
         }
      });

      return () => {
         map.removeControl(searchControl);
      };
   }, [map, onChange]);

   return null;
};

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
            <SearchControl onChange={onChange} />
         </MapContainer>
      </div>
   );
};