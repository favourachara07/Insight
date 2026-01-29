"use client";

import { useEffect, useState } from "react";
import "regenerator-runtime/runtime"; 
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useRouter } from "next/navigation";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Mic, MicOff, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function VoiceControlPage() {
  const router = useRouter();
  const { speak } = useTextToSpeech();
  
  // Commands Configuration
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
    {
      command: ["Help", "What can I say"],
      callback: () => {
        speak("You can say: Object, Read, Navigation, or Home.");
      }
    }
  ];

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  // Auto-start logic
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
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-rose-400 selection:text-black">
      {/* Background Gradient */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-rose-900/20 to-transparent pointer-events-none z-0" />

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
            <span className="text-rose-400"><Mic size={28}/></span>
            Voice Control
          </h1>
        </header>

        {/* Visualizer Area */}
        <section className="flex-1 flex flex-col items-center justify-center w-full mb-8">
            
            {/* The "Living" Microphone Orb */}
            <div className="relative flex items-center justify-center mb-12">
                {/* Pulse Rings (Only visible when listening) */}
                {listening && (
                    <>
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute w-full h-full bg-rose-500/20 rounded-full blur-xl"
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
                            className="absolute w-64 h-64 border border-rose-500/30 rounded-full"
                        />
                    </>
                )}

                {/* Main Orb */}
                <motion.div 
                    animate={listening ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`
                        relative z-10 flex items-center justify-center rounded-full transition-all duration-500
                        ${listening 
                            ? "w-48 h-48 bg-rose-500 text-white shadow-[0_0_60px_rgba(244,63,94,0.5)] border-4 border-rose-400" 
                            : "w-40 h-40 bg-zinc-900 text-zinc-600 border-4 border-zinc-800"}
                    `}
                >
                    {listening ? <Mic size={80} /> : <MicOff size={64} />}
                </motion.div>
            </div>

            {/* Transcript Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-zinc-900/50 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center min-h-[160px] flex flex-col items-center justify-center"
            >
                <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${listening ? "text-rose-400" : "text-zinc-500"}`}>
                    {listening ? (
                        <><Sparkles size={16} /> I'm Listening</>
                    ) : (
                        "Mic Paused"
                    )}
                </h2>
                <p className="text-3xl font-medium leading-relaxed text-zinc-100">
                    "{transcript || <span className="text-zinc-600 italic">Say 'Help'...</span>}"
                </p>
            </motion.div>
        </section>

        {/* Manual Trigger Button */}
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={toggleListening}
            className={`
                w-full py-6 rounded-3xl text-xl sm:text-2xl font-bold 
                flex items-center justify-center gap-3 transition-all duration-300
                ${listening 
                    ? "bg-zinc-900 border-2 border-rose-500/50 text-rose-400 hover:bg-zinc-800" 
                    : "bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-900/20"}
            `}
        >
            {listening ? (
                <>STOP LISTENING</>
            ) : (
                <>
                    <Mic size={28} fill="currentColor" />
                    START LISTENING
                </>
            )}
        </motion.button>

        {/* Screen Reader Status */}
        <div className="sr-only" aria-live="polite">
            {listening ? "Microphone is on. Listening for commands." : "Microphone is off."}
        </div>
      </div>
    </main>
  );
}