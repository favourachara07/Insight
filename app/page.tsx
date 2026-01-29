"use client";

import { Camera, Volume2, MapPin, Mic, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion"; // <--- 1. Import 'Variants'

// --- Animations ---
// 2. Add ': Variants' type annotation to both objects
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120 }, // Now TS knows "spring" is valid
  },
};

export default function Home() {
  const features = [
    {
      id: "object-id",
      label: "Object ID",
      subLabel: "Identify surroundings",
      icon: <Camera className="w-10 h-10" aria-hidden="true" />,
      ariaLabel: "Open Object Identifier Camera",
      route: "/object-id",
      color: "text-amber-400",
      border: "hover:border-amber-400/50",
      bgHover: "hover:bg-amber-400/10",
    },
    {
      id: "tts",
      label: "Read Text",
      subLabel: "Scan & read documents",
      icon: <Volume2 className="w-10 h-10" aria-hidden="true" />,
      ariaLabel: "Open Text to Speech Reader",
      route: "/tts",
      color: "text-sky-400",
      border: "hover:border-sky-400/50",
      bgHover: "hover:bg-sky-400/10",
    },
    {
      id: "gps",
      label: "Navigation",
      subLabel: "Locate where you are",
      icon: <MapPin className="w-10 h-10" aria-hidden="true" />,
      ariaLabel: "Open GPS Location Assistance",
      route: "/gps",
      color: "text-emerald-400",
      border: "hover:border-emerald-400/50",
      bgHover: "hover:bg-emerald-400/10",
    },
    {
      id: "voice",
      label: "Voice Control",
      subLabel: "Hands-free commands",
      icon: <Mic className="w-10 h-10" aria-hidden="true" />,
      ariaLabel: "Activate Voice Control System",
      route: "/voice",
      color: "text-rose-400",
      border: "hover:border-rose-400/50",
      bgHover: "hover:bg-rose-400/10",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-amber-400 selection:text-black">
      {/* Decorative background glow */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col h-full min-h-screen p-6 max-w-md mx-auto sm:max-w-4xl">
        
        {/* Header */}
        <header className="py-8 mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Project InSight
          </h1>
          <p className="text-zinc-400 text-lg">
            Your vision assistant.
          </p>
        </header>

        {/* Navigation Grid */}
        <motion.nav
          aria-label="Main Navigation"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 pb-8"
        >
          {features.map((feature) => (
            <motion.div key={feature.id} variants={cardVariants} className="h-full">
              <Link href={feature.route} className="h-full block group outline-none">
                <button
                  type="button"
                  aria-label={feature.ariaLabel}
                  className={`
                    relative w-full h-full min-h-[180px] sm:min-h-[220px]
                    flex flex-col justify-between p-6 rounded-3xl
                    bg-zinc-900/50 border border-white/10 backdrop-blur-xl
                    transition-all duration-300 ease-out
                    ${feature.border} ${feature.bgHover}
                    group-hover:scale-[1.02] group-hover:shadow-2xl
                    focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:border-transparent
                  `}
                >
                  {/* Top: Icon */}
                  <div className={`
                    p-3 rounded-2xl bg-zinc-950/50 w-fit border border-white/5
                    ${feature.color}
                  `}>
                    {feature.icon}
                  </div>

                  {/* Bottom: Label & Arrow */}
                  <div className="flex items-end justify-between w-full mt-4">
                    <div className="text-left">
                      <span className="block text-2xl font-bold text-zinc-100 group-hover:text-white">
                        {feature.label}
                      </span>
                      <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        {feature.subLabel}
                      </span>
                    </div>
                    
                    {/* Visual Arrow (Low vision cue) */}
                    <ArrowRight 
                      className="text-zinc-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" 
                      size={24} 
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </Link>
            </motion.div>
          ))}
        </motion.nav>
      </div>
    </main>
  );
}