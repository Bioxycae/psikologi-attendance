type Coordinates = {
   latitude: number;
   longitude: number;
};

export const calculateDistance = (
   pointA: Coordinates,
   pointB: Coordinates
) => {
   const earthRadius =
      6371000;

   const latitudeDiff =
      ((pointB.latitude -
         pointA.latitude) *
         Math.PI) /
      180;

   const longitudeDiff =
      ((pointB.longitude -
         pointA.longitude) *
         Math.PI) /
      180;

   const latitudeA =
      (pointA.latitude *
         Math.PI) /
      180;

   const latitudeB =
      (pointB.latitude *
         Math.PI) /
      180;

   const haversine =
      Math.sin(
         latitudeDiff / 2
      ) *
         Math.sin(
            latitudeDiff / 2
         ) +
      Math.cos(latitudeA) *
         Math.cos(latitudeB) *
         Math.sin(
            longitudeDiff / 2
         ) *
         Math.sin(
            longitudeDiff / 2
         );

   const angularDistance =
      2 *
      Math.atan2(
         Math.sqrt(haversine),
         Math.sqrt(
            1 - haversine
         )
      );

   return (
      earthRadius *
      angularDistance
   );
};

export const isWithinRadius = ({
   userLocation,
   targetLocation,
   radius,
}: {
   userLocation: Coordinates;
   targetLocation: Coordinates;
   radius: number;
}) => {
   const distance =
      calculateDistance(
         userLocation,
         targetLocation
      );

   return distance <= radius;
};