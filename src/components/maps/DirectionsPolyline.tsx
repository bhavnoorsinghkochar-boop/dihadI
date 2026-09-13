import React, { useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

interface DirectionsPolylineProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  travelMode?: "walk" | "bike" | "auto";
  strokeColor?: string;
  strokeWeight?: number;
}

export const DirectionsPolyline: React.FC<DirectionsPolylineProps> = ({
  origin,
  destination,
  travelMode = "walk",
  strokeColor = "#F59E0B",
  strokeWeight = 5,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;

    const renderer = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: false,
      polylineOptions: {
        strokeColor,
        strokeOpacity: 0.85,
        strokeWeight,
      },
    });

    setDirectionsRenderer(renderer);

    return () => {
      renderer.setMap(null);
    };
  }, [routesLib, map, strokeColor, strokeWeight]);

  useEffect(() => {
    if (!routesLib || !directionsRenderer || !origin || !destination) return;

    const directionsService = new routesLib.DirectionsService();

    let mappedTravelMode = routesLib.TravelMode.WALKING;
    if (travelMode === "bike") {
      mappedTravelMode = routesLib.TravelMode.BICYCLING;
    } else if (travelMode === "auto") {
      mappedTravelMode = routesLib.TravelMode.DRIVING;
    }

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: mappedTravelMode,
      },
      (result, status) => {
        if (status === routesLib.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        } else {
          // If walking/bicycling directions not available in this region, try driving
          if (mappedTravelMode !== routesLib.TravelMode.DRIVING) {
            directionsService.route(
              {
                origin: new google.maps.LatLng(origin.lat, origin.lng),
                destination: new google.maps.LatLng(
                  destination.lat,
                  destination.lng,
                ),
                travelMode: routesLib.TravelMode.DRIVING,
              },
              (fallbackResult, fallbackStatus) => {
                if (
                  fallbackStatus === routesLib.DirectionsStatus.OK &&
                  fallbackResult
                ) {
                  directionsRenderer.setDirections(fallbackResult);
                }
              },
            );
          }
        }
      },
    );
  }, [routesLib, directionsRenderer, origin, destination, travelMode]);

  return null;
};
