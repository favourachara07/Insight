"use client";

import { useState, useRef } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Play, Square, ChevronLeft, Volume2, Upload, Loader2 } from "lucide-react"; 
import Link from "next/link";
import { motion } from "framer-motion";
import { extractTextFromPDF } from "@/lib/pdf-utils";

export default function TextToSpeechPage() {
  const [text, setText] = useState("Welcome to Insight. I am ready to read.");
  const [isProcessing, setIsProcessing] = useState(false); // For file parsing
  const { speak, stop, isSpeaking } = useTextToSpeech();
  
  // Hidden input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    stop(); // Stop any current speech
    
    try {
      let extractedText = "";

      if (file.type === "application/pdf") {
        // Handle PDF
        extractedText = await extractTextFromPDF(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        // Handle Text Files
        extractedText = await file.text();
      } else {
        alert("Unsupported file type. Please upload a PDF or TXT file.");
        setIsProcessing(false);
        return;
      }

      // Success feedback
      if (extractedText.trim().length > 0) {
        setText(extractedText);
        speak("Document loaded successfully. Ready to read.");
      } else {
        speak("I couldn't find any text in that document.");
      }

    } catch (err) {
      console.error(err);
      speak("Error reading document.");
    } finally {
      setIsProcessing(false);
      // Reset input so you can upload the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-sky-400 selection:text-black">
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-sky-900/20 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col h-screen p-6 max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-4">
            <Link href="/">
                <button 
                className="bg-zinc-900/50 border border-white/10 text-white p-4 rounded-2xl hover:bg-white/10 active:scale-95 transition-all backdrop-blur-md" 
                aria-label="Back to Home"
                >
                <ChevronLeft size={28} />
                </button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-sky-400"><Volume2 size={28}/></span>
                Reader
            </h1>
          </div>

          {/* --- NEW: Upload Button (Top Right) --- */}
          <div>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.txt,.md"
                className="hidden"
                aria-hidden="true"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-sky-500/10 border border-sky-400/50 text-sky-400 px-4 py-3 rounded-2xl font-bold hover:bg-sky-400 hover:text-black transition-all active:scale-95"
                aria-label="Upload Document to Read"
            >
                {isProcessing ? (
                    <Loader2 size={24} className="animate-spin" />
                ) : (
                    <Upload size={24} />
                )}
                <span className="hidden sm:inline">{isProcessing ? "LOADING..." : "UPLOAD"}</span>
            </button>
          </div>
        </header>

        {/* Input Area (Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 mb-6 relative group"
        >
          <div className="absolute inset-0 bg-sky-400/5 rounded-3xl blur-xl group-focus-within:bg-sky-400/10 transition-colors duration-500" />
          <textarea
            className={`
              relative w-full h-full bg-zinc-900/50 backdrop-blur-xl
              border-2 border-white/10 rounded-3xl p-6 
              text-3xl leading-relaxed text-zinc-100 placeholder:text-zinc-600
              resize-none focus:outline-none focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10
              transition-all duration-300
              ${isProcessing ? "opacity-50 pointer-events-none" : "opacity-100"}
            `}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Text content to read"
            placeholder={isProcessing ? "Extracting text from document..." : "Type text here or upload a file..."}
          />
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-40 grid grid-cols-2 gap-4 mb-4"
        >
          {/* Play Button */}
          <button
            onClick={() => speak(text)}
            disabled={isSpeaking || isProcessing}
            className={`
              relative overflow-hidden group rounded-3xl border border-white/5
              flex flex-col items-center justify-center transition-all duration-300
              ${isSpeaking || isProcessing
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-sky-500 text-white hover:bg-sky-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-sky-900/20'}
            `}
            aria-label="Read Text Aloud"
          >
            <div className="z-10 flex flex-col items-center">
                <Play size={48} fill="currentColor" className={isSpeaking ? "opacity-50" : "opacity-100"} />
                <span className="text-lg font-bold mt-2 uppercase tracking-widest opacity-80">
                    {isSpeaking ? "Reading..." : "Play"}
                </span>
            </div>
          </button>

          {/* Stop Button */}
          <button
            onClick={stop}
            className={`
              rounded-3xl border border-white/5
              flex flex-col items-center justify-center transition-all duration-300
              bg-zinc-900/80 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500
              hover:scale-[1.02] active:scale-[0.98]
            `}
            aria-label="Stop Reading"
          >
             <Square size={48} fill="currentColor" />
             <span className="text-lg font-bold mt-2 uppercase tracking-widest opacity-80">Stop</span>
          </button>
        </motion.div>
      </div>
    </main>
  );
}