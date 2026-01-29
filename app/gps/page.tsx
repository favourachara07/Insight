// src/app/navigation/page.tsx
"use client";

import { useGPS } from "@/hooks/useGPS";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { useEffect } from "react";

// Helper to turn degrees into words
const getDirectionLabel = (heading: number | null) => {
  if (heading === null) return "Unknown Direction";
  const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  // Split 360 degrees into 8 chunks (45 degrees each)
  const index = Math.round(heading / 45) % 8;
  return directions[index];
};

export default function NavigationPage() {
  const { latitude, longitude, address, heading, error, loading } = useGPS();
  const { speak, stop } = useTextToSpeech();
  const directionText = getDirectionLabel(heading);

  // Auto-announce location when it loads (Optional, but helpful for blind users)
  useEffect(() => {
    if (!loading && address) {
      // Small timeout to let screen reader finish page load announcement
      const timer = setTimeout(() => {
        speak(`Location found. You are at ${address.split(",")[0]}. Facing ${directionText}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, address, directionText, speak]);

  if (error) {
    return (
      <main className="min-h-screen bg-black text-red-500 p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle size={80} aria-hidden="true" />
        <h1 className="text-4xl font-bold mt-4">GPS Error</h1>
        <p className="text-xl mt-2">{error}</p>
        <button 
           onClick={() => window.location.reload()}
           className="mt-8 bg-yellow-400 text-black px-8 py-4 rounded-xl text-2xl font-bold"
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-yellow-400 p-4 flex flex-col gap-4">
      <h1 className="sr-only">GPS Navigation</h1>

      {/* Massive Status Card */}
      <section 
        className="flex-1 border-4 border-yellow-400 rounded-xl p-6 flex flex-col justify-center items-center text-center"
        aria-label="Current Location Display"
      >
        <div className="mb-4">
          <Navigation 
            size={80} 
            className={`transition-all duration-500`}
            style={{ transform: `rotate(${heading || 0}deg)` }} // Visual compass for low vision
            aria-hidden="true"
          />
        </div>
        
        <h2 className="text-2xl text-gray-400 uppercase tracking-widest mb-2">You are facing</h2>
        <p className="text-5xl font-bold text-white mb-8">{directionText}</p>

        <h2 className="text-2xl text-gray-400 uppercase tracking-widest mb-2">Near</h2>
        <p className="text-3xl font-bold leading-relaxed">
          {loading ? "Locating..." : address?.split(",")[0] || "Unknown Location"}
        </p>
         {/* Show full address in smaller text for detail */}
        <p className="text-lg text-gray-500 mt-4 line-clamp-2">
            {address}
        </p>
      </section>

      {/* Control Buttons */}
      <div className="h-1/3 grid grid-cols-1 gap-4">
        <button
          onClick={() => speak(`You are at ${address}. Facing ${directionText}.`)}
          className="bg-yellow-400 text-black rounded-xl text-3xl font-bold flex items-center justify-center gap-4 active:scale-95 transition-transform"
          aria-label="Read my current location"
        >
          <MapPin size={48} aria-hidden="true" />
          WHERE AM I?
        </button>
      </div>
    </main>
  );
}