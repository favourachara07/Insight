"use client";

import { useState } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Play, Square, ChevronLeft } from "lucide-react"; 
import Link from "next/link";

export default function TextToSpeechPage() {
  const [text, setText] = useState("Welcome to Antigravity. I am ready to read.");
  const { speak, stop, isSpeaking } = useTextToSpeech();

  return (
    <main className="min-h-screen bg-black text-yellow-400 p-4 flex flex-col gap-4">
      {/* --- NEW: Header --- */}
      <header className="flex items-center gap-4 mb-2">
        <Link href="/">
             <button className="bg-yellow-400 text-black p-3 rounded-xl hover:bg-white transition-colors" aria-label="Back to Home">
                <ChevronLeft size={32} />
             </button>
        </Link>
        <h1 className="text-2xl font-bold">Text Reader</h1>
      </header>

      {/* Input Area */}
      <textarea
        className="w-full flex-1 min-h-[40vh] bg-gray-900 border-4 border-yellow-400 rounded-xl p-4 text-3xl focus:outline-none focus:ring-4 ring-white resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Text content to read"
        placeholder="Type text here..."
      />

      {/* Controls */}
      <div className="h-48 grid grid-cols-2 gap-4">
        <button
          onClick={() => speak(text)}
          disabled={isSpeaking}
          className={`flex flex-col items-center justify-center rounded-xl border-4 ${isSpeaking ? 'bg-gray-800 border-gray-600 opacity-50' : 'bg-yellow-400 text-black border-yellow-400'}`}
          aria-label="Read Text Aloud"
        >
          <Play size={48} aria-hidden="true" />
          <span className="text-2xl font-bold mt-2">PLAY</span>
        </button>

        <button
          onClick={stop}
          className="bg-red-600 text-white border-4 border-red-600 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
          aria-label="Stop Reading"
        >
          <Square size={48} aria-hidden="true" />
          <span className="text-2xl font-bold mt-2">STOP</span>
        </button>
      </div>
    </main>
  );
}