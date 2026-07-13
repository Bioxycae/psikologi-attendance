"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";

const SearchControl = ({ onChange }: { onChange: ({ latitude, longitude }: { latitude: number, longitude: number }) => void }) => {
   const map = useMap();
   const onChangeRef = useRef(onChange);
   useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

   useEffect(() => {
      const provider = new OpenStreetMapProvider();
      // @ts-expect-error - leaflet-geosearch types are incomplete
      const searchControl = new GeoSearchControl({
         provider: provider,
         style: "bar",
         showMarker: false,
         showPopup: false,
         autoClose: true,
         searchLabel: "Cari lokasi...",
      });

      map.addControl(searchControl);
      
      const handleShowLocation = (result: any) => {
         if (result && result.location) {
            onChangeRef.current({
               latitude: result.location.y,
               longitude: result.location.x,
            });
         }
      };

      map.on("geosearch/showlocation", handleShowLocation);

      return () => {
         try {
            map.removeControl(searchControl);
            map.off("geosearch/showlocation", handleShowLocation);
         } catch (e) {}
      };
   }, [map]);

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
   const map = useMap();
   const onChangeRef = useRef(onChange);
   useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

   useEffect(() => {
      map.flyTo([latitude, longitude], map.getZoom());
   }, [latitude, longitude, map]);

   useMapEvents({
      click(event) {
         onChangeRef.current({
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
   const [mountId, setMountId] = useState("");

   useEffect(() => {
      setMountId(Math.random().toString(36).substring(7));
   }, []);

   if (!mountId) {
      return <div className="h-100 w-full rounded-3xl border border-(--ketiga) bg-slate-100 animate-pulse" />;
   }

   return (
      <div className="overflow-hidden rounded-3xl border border-(--ketiga)">
         <MapContainer
            key={mountId}
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