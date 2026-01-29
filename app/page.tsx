"use client";

import { Camera, Volume2, MapPin, Mic } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      id: "object-id",
      label: "Object Identification",
      icon: <Camera className="w-12 h-12 mb-4" aria-hidden="true" />,
      ariaLabel: "Open Object Identifier Camera",
      route: "/detect",
    },
    {
      id: "tts",
      label: "Read Text",
      icon: <Volume2 className="w-12 h-12 mb-4" aria-hidden="true" />,
      ariaLabel: "Open Text to Speech Reader",
      route: "/tts",
    },
    {
      id: "gps",
      label: "Navigation",
      icon: <MapPin className="w-12 h-12 mb-4" aria-hidden="true" />,
      ariaLabel: "Open GPS Location Assistance",
      route: "/gps",
    },
    {
      id: "voice",
      label: "Voice Control",
      icon: <Mic className="w-12 h-12 mb-4" aria-hidden="true" />,
      ariaLabel: "Activate Voice Control System",
      route: "/voice",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-8">
      <h1 className="sr-only">Insight App Home Screen</h1>

      <nav
        aria-label="Main Navigation"
        className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full"
      >
        {features.map((feature) => (
          <Link key={feature.id} href={feature.route}>
            <button
              type="button"
              aria-label={feature.ariaLabel}
              className="flex flex-col items-center justify-center w-full h-full min-h-[25vh]
                         border-4 border-foreground rounded-xl
                         bg-background text-foreground
                         hover:bg-foreground hover:text-background
                         focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:ring-white
                         transition-colors duration-200
                         active:scale-[0.98]"
              onClick={() => {
                // Placeholder for haptic feedback
                console.log(`${feature.label} clicked`);
              }}
            >
              {feature.icon}
              <span className="text-2xl sm:text-3xl font-bold uppercase tracking-wide">
                {feature.label}
              </span>
            </button>
          </Link>
        ))}
      </nav>
    </main>
  );
}
