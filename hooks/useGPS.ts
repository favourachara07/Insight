// src/hooks/useGPS.ts
"use client";

import { useState, useEffect } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  heading: number | null; // 0-360 degrees
  error: string | null;
  loading: boolean;
}

export const useGPS = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    heading: null,
    error: null,
    loading: true,
  });

  // Helper: Convert Lat/Long to Address using OpenStreetMap (Free, no key needed for testing)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "AntigravityApp/1.0", // Required by OSM
          },
        }
      );
      const data = await response.json();
      return data.display_name; // Returns full address string
    } catch (err) {
      console.error("Reverse Geocoding Error:", err);
      return "Address unavailable";
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: "Geolocation not supported", loading: false }));
      return;
    }

    // 1. Watch Position (Real-time updates)
    const geoId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, heading } = position.coords;
        
        // Only fetch address if we moved significantly (optimization) or first load
        // For simplicity here, we fetch on every major update.
        // In prod, you'd debounce this to save API calls.
        const address = await fetchAddress(latitude, longitude);

        setLocation({
          latitude,
          longitude,
          heading,
          address,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setLocation((prev) => ({ ...prev, error: error.message, loading: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(geoId);
  }, []);

  return location;
};