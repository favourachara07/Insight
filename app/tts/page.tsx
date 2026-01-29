// src/app/tts/page.tsx
"use client";

import { useState } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Play, Square } from "lucide-react"; // Assuming you installed lucide-react

export default function TextToSpeechPage() {
  const [text, setText] = useState("Welcome to Antigravity. I am ready to read.");
  const { speak, stop, isSpeaking } = useTextToSpeech();

  return (
    <main className="min-h-screen bg-black text-yellow-400 p-6 flex flex-col gap-6">
      {/* Header */}
      <nav>
        <h1 className="text-3xl font-bold mb-4">Text Reader</h1>
      </nav>

      {/* Input Area - High Contrast */}
      <textarea
        className="w-full h-48 bg-gray-900 border-4 border-yellow-400 rounded-xl p-4 text-2xl focus:outline-none focus:ring-4 ring-white"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Text content to read"
        placeholder="Type text here..."
      />

      {/* Control Area - Split Screen Buttons */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Play Button */}
        <button
          onClick={() => speak(text)}
          disabled={isSpeaking}
          className={`
            flex flex-col items-center justify-center rounded-xl border-4 
            ${isSpeaking ? 'bg-gray-800 border-gray-600 opacity-50' : 'bg-yellow-400 text-black border-yellow-400'}
          `}
          aria-label="Read Text Aloud"
        >
          <Play size={64} aria-hidden="true" />
          <span className="text-2xl font-bold mt-2">PLAY</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={stop}
          className="bg-red-600 text-white border-4 border-red-600 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
          aria-label="Stop Reading"
        >
          <Square size={64} aria-hidden="true" />
          <span className="text-2xl font-bold mt-2">STOP</span>
        </button>
      </div>
    </main>
  );
}