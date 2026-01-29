"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2, ScanEye, ChevronLeft, Camera, Zap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ObjectDetectionPage() {
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLog, setDebugLog] = useState<string>("Initializing AI...");
  const { speak, stop } = useTextToSpeech();

  // 1. Load Model
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        setDebugLog("Loading Neural Network...");
        await tf.ready();
        // Use 'lite_mobilenet_v2' for speed on mobile
        const loadedModel = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        
        if (isMounted) {
          setModel(loadedModel);
          setLoading(false);
          setDebugLog("System Ready");
          speak("Camera ready. Tap to scan.");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Model Load Error:", err);
        setDebugLog("Offline Mode / Error");
        setLoading(false); 
      }
    };

    loadModel();

    return () => { isMounted = false; };
  }, [speak]);

  // 2. Detection Logic
  const captureAndIdentify = useCallback(async () => {
    if (!model || isProcessing) return;

    setIsProcessing(true);
    stop();

    const video = webcamRef.current?.video;

    if (!video || video.readyState !== 4) {
        speak("Camera is focusing...");
        setIsProcessing(false);
        return;
    }

    try {
      if (navigator.vibrate) navigator.vibrate(50);
      
      const predictions = await model.detect(video);
      const confidentPredictions = predictions.filter(p => p.score > 0.5);

      if (confidentPredictions.length === 0) {
        speak("I don't see any recognizable objects.");
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
      speak("Analysis failed.");
    } finally {
      setIsProcessing(false);
    }
  }, [model, isProcessing, speak, stop]);

  return (
    <main className="h-screen w-full bg-zinc-950 relative flex flex-col overflow-hidden">
      
      {/* --- HUD Header --- */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
        <Link href="/">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="bg-zinc-900/60 border border-white/10 text-white p-4 rounded-2xl backdrop-blur-md pointer-events-auto shadow-lg"
            aria-label="Go Back Home"
          >
            <ChevronLeft size={28} />
          </motion.button>
        </Link>
        
        {/* Status Badge */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-zinc-900/60 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md"
        >
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-zinc-500' : 'bg-amber-400 animate-pulse'}`} />
            {debugLog}
        </motion.div>
      </header>

      {/* --- Camera Feed --- */}
      <div className="absolute inset-0 z-0 bg-zinc-900">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          onUserMediaError={() => setDebugLog("Camera Permission Denied")}
          className="h-full w-full object-cover opacity-90"
        />
        {/* Scanner Overlay Grid (Decorative) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 border-[16px] border-white/5 rounded-3xl pointer-events-none m-4"></div>
      </div>

      {/* --- Interaction Layer --- */}
      <button
        onClick={captureAndIdentify}
        disabled={loading || isProcessing}
        className="absolute inset-0 z-20 w-full h-full flex flex-col items-center justify-end pb-16 focus:outline-none group"
        aria-label={loading ? "System initializing, please wait" : "Tap anywhere to scan"}
      >
        <AnimatePresence mode="wait">
            <motion.div 
                key={loading ? "loading" : isProcessing ? "processing" : "ready"}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`
                    px-8 py-6 rounded-full flex items-center gap-4 shadow-2xl border border-white/10 backdrop-blur-xl transition-all duration-300
                    ${loading 
                        ? 'bg-zinc-900/80 text-zinc-500' 
                        : isProcessing 
                            ? 'bg-zinc-900/90 text-amber-400 border-amber-500/50' 
                            : 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 active:scale-95'}
                `}
            >
                {loading ? (
                    <>
                       <Loader2 size={32} className="animate-spin" />
                       <span className="text-xl font-bold tracking-wide">INITIALIZING...</span>
                    </>
                ) : isProcessing ? (
                    <>
                       <Loader2 size={32} className="animate-spin" />
                       <span className="text-xl font-bold tracking-wide">ANALYZING SCENE...</span>
                    </>
                ) : (
                    <>
                       <ScanEye size={32} strokeWidth={2.5} />
                       <div className="flex flex-col items-start">
                           <span className="text-lg font-black tracking-wider leading-none">TAP TO SCAN</span>
                           <span className="text-xs font-medium opacity-70">AI Object Detection</span>
                       </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
      </button>
    </main>
  );
}