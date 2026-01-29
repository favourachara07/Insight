// src/hooks/useTextToSpeech.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    // Load available voices on mount
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a good default voice (Google, Microsoft, or default local)
      const preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      setVoice(preferredVoice);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously, so we listen for the change event
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Cleanup: Cancel speech if the user leaves the page/component
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!text) return;

    // Always cancel previous speech to avoid queue buildup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
    }

    // Adjust rate/pitch for better accessibility clarity
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [voice]);

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return { speak, stop, isSpeaking, isPaused };
};