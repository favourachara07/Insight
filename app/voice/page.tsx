"use client";

import { useState, useRef } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { ChevronLeft, Upload, FileText, Play, Pause, Volume2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { extractTextFromPDF } from "@/lib/pdf-utils";

export default function TTSPage() {
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");
    setFileName(file.name);

    try {
      if (file.type === "application/pdf") {
        // Extract text from PDF
        const extractedText = await extractTextFromPDF(file);
        setText(extractedText);
      } else if (file.type === "text/plain") {
        // Read plain text file
        const textContent = await file.text();
        setText(textContent);
      } else {
        setError("Please upload a PDF or TXT file");
        setFileName("");
      }
    } catch (err) {
      console.error("File processing error:", err);
      setError("Failed to process file. Please try again.");
      setFileName("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!text.trim()) {
      setError("Please enter or upload some text first");
      return;
    }
    setError("");
    speak(text);
  };

  const handleStop = () => {
    stop();
  };

  const handleClear = () => {
    setText("");
    setFileName("");
    setError("");
    stop();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
            <span className="text-rose-400"><Volume2 size={28}/></span>
            Text to Speech
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* File Upload Section */}
          <div className="bg-zinc-900/50 border border-white/10 backdrop-blur-xl rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-4">
              Upload Document
            </h2>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            
            <label htmlFor="file-upload">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center cursor-pointer hover:border-rose-500/50 transition-all"
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent" />
                    <p className="text-zinc-400">Processing file...</p>
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={48} className="text-rose-400" />
                    <p className="text-zinc-100 font-medium">{fileName}</p>
                    <p className="text-xs text-zinc-500">Click to upload a different file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload size={48} className="text-zinc-600" />
                    <p className="text-zinc-400">Click to upload PDF or TXT file</p>
                    <p className="text-xs text-zinc-600">Supports .pdf and .txt files</p>
                  </div>
                )}
              </motion.div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Text Input Area */}
          <div className="flex-1 bg-zinc-900/50 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-4">
              Text Content
            </h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here, or upload a document above..."
              className="flex-1 bg-zinc-950/50 border border-white/5 rounded-2xl p-4 text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-rose-500/50 transition-all"
              rows={8}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            {isSpeaking ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleStop}
                className="flex-1 py-5 rounded-3xl text-xl font-bold bg-zinc-900 border-2 border-rose-500/50 text-rose-400 hover:bg-zinc-800 flex items-center justify-center gap-3 transition-all"
              >
                <Pause size={24} fill="currentColor" />
                STOP
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSpeak}
                disabled={!text.trim() || isLoading}
                className={`flex-1 py-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 transition-all ${
                  text.trim() && !isLoading
                    ? "bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-900/20"
                    : "bg-zinc-900 text-zinc-600 border-2 border-zinc-800 cursor-not-allowed"
                }`}
              >
                <Play size={24} fill="currentColor" />
                SPEAK
              </motion.button>
            )}
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              disabled={!text && !fileName}
              className={`px-8 py-5 rounded-3xl text-xl font-bold transition-all ${
                text || fileName
                  ? "bg-zinc-900 border-2 border-white/10 text-zinc-300 hover:bg-zinc-800"
                  : "bg-zinc-900 text-zinc-700 border-2 border-zinc-900 cursor-not-allowed"
              }`}
            >
              CLEAR
            </motion.button>
          </div>
        </div>

        {/* Screen Reader Status */}
        <div className="sr-only" aria-live="polite">
          {isSpeaking ? "Speaking text" : "Ready to speak"}
        </div>
      </div>
    </main>
  );
}