// src/app/voice/page.tsx
"use client";

import { useEffect, useState } from "react";
import "regenerator-runtime/runtime"; // Required for speech recognition in some build setups
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useRouter } from "next/navigation";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Mic, MicOff, Command } from "lucide-react";

export default function VoiceControlPage() {
  const router = useRouter();
  const { speak } = useTextToSpeech();
  const [redirecting, setRedirecting] = useState(false);

  // 1. Define Voice Commands
  const commands = [
    {
      command: ["Go home", "Home", "Back", "Menu"],
      callback: () => {
        speak("Going to home menu.");
        setRedirecting(true);
        router.push("/");
      },
    },
    {
      command: ["Object", "Identify", "Camera", "Look", "Scan"],
      callback: () => {
        speak("Opening object identification.");
        setRedirecting(true);
        router.push("/object-id");
      },
    },
    {
      command: ["Read", "Text", "Reader", "Speech"],
      callback: () => {
        speak("Opening text reader.");
        setRedirecting(true);
        router.push("/tts");
      },
    },
    {
      command: ["Navigation", "GPS", "Where am I", "Location", "Map"],
      callback: () => {
        speak("Opening navigation.");
        setRedirecting(true);
        router.push("/navigation");
      },
    },
    // Help command
    {
      command: ["Help", "What can I say"],
      callback: () => {
        speak("You can say: Object, Read, Navigation, or Home.");
      }
    }
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });

  // 2. Auto-start on mount (Optional, but good for accessibility)
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      speak("Your browser does not support voice control.");
    } else {
        // We delay start slightly to avoid conflict with page load sounds
        setTimeout(() => {
            SpeechRecognition.startListening({ continuous: true });
        }, 500);
    }
    // Cleanup
    return () => {
        SpeechRecognition.stopListening();
    };
  }, [browserSupportsSpeechRecognition, speak]);

  // 3. Toggle Function
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      speak("Voice control off.");
    } else {
      resetTranscript();
      speak("Listening.");
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <main className="h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-2xl">Browser not supported. Please use Chrome.</h1>
      </main>
    );
  }

  return (
    <main className="h-screen bg-black text-yellow-400 p-6 flex flex-col items-center justify-between">
      {/* Visual Feedback for Low Vision */}
      <section className="flex-1 flex flex-col items-center justify-center w-full">
        <div className={`
            relative flex items-center justify-center rounded-full transition-all duration-300
            ${listening ? "w-64 h-64 bg-yellow-400 text-black animate-pulse" : "w-48 h-48 border-4 border-gray-600 text-gray-600"}
        `}>
            {listening ? <Mic size={80} /> : <MicOff size={64} />}
        </div>

        <div className="mt-12 text-center h-24">
            <h2 className="text-xl text-gray-500 mb-2 uppercase tracking-widest">
                {listening ? "I am listening..." : "Tap to Speak"}
            </h2>
            <p className="text-3xl font-bold text-white px-4 break-words">
                "{transcript || "..."}"
            </p>
        </div>
      </section>

      {/* Manual Trigger Button */}
      <button
        onClick={toggleListening}
        className={`
            w-full py-8 rounded-xl text-3xl font-bold mb-8 border-4 transition-all
            ${listening ? "bg-black border-yellow-400 text-yellow-400" : "bg-yellow-400 border-yellow-400 text-black"}
        `}
        aria-label={listening ? "Stop Listening" : "Start Listening"}
      >
        {listening ? "STOP" : "START"}
      </button>

      {/* Hidden Helper for Screen Readers */}
      <div className="sr-only">
        Current status: {listening ? "Listening for commands" : "Voice control inactive"}
      </div>
    </main>
  );
}