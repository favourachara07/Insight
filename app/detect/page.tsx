"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2, ScanEye, ChevronLeft, Home } from "lucide-react"; // Added Home/ChevronLeft
import Link from "next/link"; // Added Link

export default function ObjectDetectionPage() {
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLog, setDebugLog] = useState<string>("Initializing...");
  const { speak, stop } = useTextToSpeech();

  // 1. Load Model
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        setDebugLog("Loading AI...");
        await tf.ready();
        // Use 'lite_mobilenet_v2' for speed
        const loadedModel = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        
        if (isMounted) {
          setModel(loadedModel);
          setLoading(false);
          setDebugLog("Ready.");
          speak("Camera ready.");
        }
      } catch (err: any) {
        console.error("Model Load Error:", err);
        setDebugLog("AI Error (Offline?)");
        // Even if AI fails, let the user see the camera and go back
        setLoading(false); 
      }
    };

    loadModel();

    return () => { isMounted = false; };
  }, [speak]);

  const captureAndIdentify = useCallback(async () => {
    if (!model || isProcessing) return;

    setIsProcessing(true);
    stop();

    const video = webcamRef.current?.video;

    if (!video || video.readyState !== 4) {
        speak("Camera not focused yet.");
        setIsProcessing(false);
        return;
    }

    try {
      if (navigator.vibrate) navigator.vibrate(50);
      
      const predictions = await model.detect(video);
      const confidentPredictions = predictions.filter(p => p.score > 0.5);

      if (confidentPredictions.length === 0) {
        speak("I don't see anything I know.");
      } else {
        const counts: Record<string, number> = {};
        confidentPredictions.forEach(p => {
          counts[p.class] = (counts[p.class] || 0) + 1;
        });

        const description = Object.entries(counts)
          .map(([name, count]) => `${count} ${name}${count > 1 ? 's' : ''}`)
          .join(" and ");

        speak(`I see ${description}.`);
      }
    } catch (err) {
      speak("Detection failed.");
    } finally {
      setIsProcessing(false);
    }
  }, [model, isProcessing, speak, stop]);

  return (
    <main className="h-screen w-full bg-black relative flex flex-col">
      {/* --- NEW: Navigation Header --- */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
        <Link href="/">
          <button 
            className="bg-yellow-400 text-black p-3 rounded-xl border-4 border-white pointer-events-auto shadow-lg active:scale-95"
            aria-label="Go Back Home"
          >
            <Home size={32} aria-hidden="true" />
          </button>
        </Link>
        {/* Debug Status Badge */}
        <div className="bg-black/70 text-yellow-400 px-3 py-1 rounded-full text-xs font-mono border border-yellow-400/30">
          {debugLog}
        </div>
      </header>

      {/* Camera Layer */}
      <div className="absolute inset-0 z-0">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          onUserMediaError={() => setDebugLog("Camera Error")}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Interaction Layer */}
      <button
        onClick={captureAndIdentify}
        disabled={loading || isProcessing}
        className="absolute inset-0 z-20 w-full h-full flex flex-col items-center justify-end pb-12 focus:outline-none"
        aria-label={loading ? "Please wait, AI is loading" : "Tap to identify object"}
      >
        <div className={`
            px-8 py-5 rounded-full flex items-center gap-4 shadow-xl border-4 transition-all
            ${loading ? 'bg-gray-800 border-gray-600 text-gray-400' : 
              isProcessing ? 'bg-white border-yellow-400 text-black' : 'bg-yellow-400 border-white text-black'}
        `}>
            {loading ? (
                <>
                   <Loader2 size={32} className="animate-spin" />
                   <span className="text-2xl font-bold">Loading AI...</span>
                </>
            ) : isProcessing ? (
                <>
                   <Loader2 size={32} className="animate-spin" />
                   <span className="text-2xl font-bold">Analyzing...</span>
                </>
            ) : (
                <>
                   <ScanEye size={32} />
                   <span className="text-2xl font-bold">Tap to Identify</span>
                </>
            )}
        </div>
      </button>
    </main>
  );
}