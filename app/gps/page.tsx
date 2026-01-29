"use client";

import { useGPS } from "@/hooks/useGPS";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { MapPin, Navigation, AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Helper to turn degrees into words
const getDirectionLabel = (heading: number | null) => {
  if (heading === null) return "Unknown Direction";
  const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
};

export default function NavigationPage() {
  const { latitude, longitude, address, heading, error, loading } = useGPS();
  const { speak } = useTextToSpeech();
  const directionText = getDirectionLabel(heading);

  // Auto-announce location
  useEffect(() => {
    if (!loading && address) {
      const timer = setTimeout(() => {
        speak(`Location found. You are at ${address.split(",")[0]}. Facing ${directionText}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, address, directionText, speak]);

  // --- ERROR STATE UI ---
  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-rose-400 p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-rose-500/10 p-8 rounded-full mb-6 border border-rose-500/20">
            <AlertCircle size={64} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">GPS Unavailable</h1>
        <p className="text-lg text-rose-300 mb-8 max-w-xs mx-auto">{error}</p>
        <button 
           onClick={() => window.location.reload()}
           className="bg-rose-600 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-rose-500 transition-all active:scale-95 flex items-center gap-3"
        >
          <RefreshCw size={24} />
          Try Again
        </button>
      </main>
    );
  }

  // --- MAIN UI ---
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-400 selection:text-black">
      {/* Background Gradient */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col h-screen p-6 max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-6 pt-4">
          <Link href="/">
            <button 
              className="bg-zinc-900/50 border border-white/10 text-white p-4 rounded-2xl hover:bg-white/10 active:scale-95 transition-all backdrop-blur-md" 
              aria-label="Back to Home"
            >
              <ChevronLeft size={28} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-emerald-400"><MapPin size={28}/></span>
            Navigation
          </h1>
        </header>

        <h1 className="sr-only">GPS Navigation Dashboard</h1>

        {/* Dashboard Card */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col justify-between mb-6 bg-zinc-900/50 border border-white/10 backdrop-blur-xl rounded-3xl p-6 relative overflow-hidden group"
          aria-label="Current Location Display"
        >
            {/* Subtle internal glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            {/* Top: Compass Visual */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full border-4 border-zinc-800 flex items-center justify-center mb-6 bg-zinc-950/50 shadow-inner">
                    {/* Tick Marks for decoration */}
                    <div className="absolute inset-2 border border-zinc-700/50 rounded-full opacity-50" />
                    <div className="absolute top-2 text-xs font-bold text-zinc-500">N</div>
                    
                    {/* Rotating Needle */}
                    <Navigation 
                        size={80} 
                        className={`text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-transform duration-700 ease-out`}
                        style={{ transform: `rotate(${heading || 0}deg)` }} 
                        aria-hidden="true"
                    />
                </div>
                
                <h2 className="text-sm font-bold text-emerald-400/80 uppercase tracking-[0.2em] mb-2">Heading</h2>
                <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{directionText}</p>
            </div>

            {/* Bottom: Address */}
            <div className="border-t border-white/5 pt-6 text-center">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Current Location</h2>
                <p className="text-2xl sm:text-3xl font-medium leading-relaxed text-zinc-100">
                    {loading ? (
                        <span className="animate-pulse text-zinc-400">Locating...</span>
                    ) : (
                        address?.split(",")[0] || "Unknown Location"
                    )}
                </p>
                {address && (
                    <p className="text-sm text-zinc-500 mt-2 truncate px-4">
                        {address}
                    </p>
                )}
            </div>
        </motion.section>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => speak(`You are at ${address}. Facing ${directionText}.`)}
          className={`
            w-full py-6 rounded-3xl text-xl sm:text-2xl font-bold 
            flex items-center justify-center gap-4 
            shadow-lg shadow-emerald-900/20 border border-white/5
            transition-all duration-300 active:scale-[0.98]
            bg-emerald-500 text-white hover:bg-emerald-400
          `}
          aria-label="Read my current location"
        >
          <MapPin size={32} className="text-emerald-950" fill="currentColor" aria-hidden="true" />
          <span className="text-emerald-950">WHERE AM I?</span>
        </motion.button>
      </div>
    </main>
  );
}