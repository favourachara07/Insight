"use client";

import { useEffect, useState } from "react";
import "regenerator-runtime/runtime"; 
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useRouter } from "next/navigation";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Mic, MicOff, ChevronLeft } from "lucide-react";
import Link from "next/link"; // Added Link

export default function VoiceControlPage() {
  const router = useRouter();
  const { speak } = useTextToSpeech();
  
  // ... (Your existing commands array and logic remains the same) ...
  const commands = [
    {
      command: ["Go home", "Home", "Back", "Menu"],
      callback: () => {
        speak("Going to home menu.");
        router.push("/");
      },
    },
    {
      command: ["Object", "Identify", "Camera", "Look", "Scan"],
      callback: () => {
        speak("Opening object identification.");
        router.push("/object-id");
      },
    },
    {
      command: ["Read", "Text", "Reader", "Speech"],
      callback: () => {
        speak("Opening text reader.");
        router.push("/tts");
      },
    },
    {
        command: ["Navigation", "GPS", "Where am I", "Location", "Map"],
        callback: () => {
          speak("Opening navigation.");
          router.push("/navigation");
        },
      },
    // ... other commands
  ];

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  // ... (Your existing useEffects) ...
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      speak("Browser not supported.");
    } else {
        setTimeout(() => { SpeechRecognition.startListening({ continuous: true }); }, 500);
    }
    return () => { SpeechRecognition.stopListening(); };
  }, [browserSupportsSpeechRecognition, speak]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) return null;

  return (
    <main className="h-screen bg-black text-yellow-400 p-6 flex flex-col items-center justify-between">
      {/* --- NEW: Header --- */}
      <header className="w-full flex justify-start">
        <Link href="/">
             <button className="bg-gray-800 text-white p-4 rounded-xl border-2 border-gray-600" aria-label="Exit Voice Mode">
                <ChevronLeft size={32} />
             </button>
        </Link>
      </header>

      {/* Visual Feedback */}
      <section className="flex-1 flex flex-col items-center justify-center w-full">
        <div className={`
            relative flex items-center justify-center rounded-full transition-all duration-300
            ${listening ? "w-64 h-64 bg-yellow-400 text-black animate-pulse shadow-[0_0_50px_rgba(250,204,21,0.5)]" : "w-48 h-48 border-4 border-gray-600 text-gray-600"}
        `}>
            {listening ? <Mic size={80} /> : <MicOff size={64} />}
        </div>

        <div className="mt-12 text-center min-h-[6rem]">
            <h2 className="text-xl text-gray-500 mb-2 uppercase tracking-widest">
                {listening ? "I am listening..." : "Mic Paused"}
            </h2>
            <p className="text-3xl font-bold text-white px-4 break-words leading-tight">
                "{transcript}"
            </p>
        </div>
      </section>

      {/* Manual Trigger */}
      <button
        onClick={toggleListening}
        className={`
            w-full py-6 rounded-xl text-3xl font-bold mb-4 border-4 transition-all
            ${listening ? "bg-black border-yellow-400 text-yellow-400" : "bg-yellow-400 border-yellow-400 text-black"}
        `}
      >
        {listening ? "STOP LISTENING" : "START LISTENING"}
      </button>
    </main>
  );
}