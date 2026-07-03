import { useCallback, useEffect, useRef, useState } from 'react';

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string; confidence?: number } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): (new () => BrowserSpeechRecognition) | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

const SpeechRecognitionCtor = getSpeechRecognitionCtor();

export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  lastConfidence: number;
  error: string | null;
}

export function useSpeechRecognition(options: {
  enabled: boolean;
  paused: boolean;
  lang?: string;
  onFinalTranscript: (text: string, confidence: number) => void;
}) {
  const { enabled, paused, lang = 'en-US', onFinalTranscript } = options;

  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!SpeechRecognitionCtor,
    isListening: false,
    interimTranscript: '',
    lastConfidence: 0,
    error: null,
  });

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const onFinalRef = useRef(onFinalTranscript);
  const lastFinalRef = useRef('');
  const restartTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const scheduleRestart = useCallback(
    (delayMs = 300) => {
      if (!enabled || paused || !recognitionRef.current) return;
      clearRestartTimer();
      restartTimerRef.current = window.setTimeout(() => {
        if (!enabled || paused || !recognitionRef.current) return;
        try {
          recognitionRef.current.start();
          setState((prev) => ({ ...prev, isListening: true, error: null }));
        } catch {
          // Already running — ignore
        }
      }, delayMs);
    },
    [enabled, paused, clearRestartTimer],
  );

  useEffect(() => {
    if (!SpeechRecognitionCtor) {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: 'Speech recognition is not supported in this browser. Use Chrome or Edge, or type your answers.',
      }));
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim() ?? '';
        const confidence = result[0]?.confidence ?? 0;

        if (!text) continue;

        if (result.isFinal) {
          if (text === lastFinalRef.current) continue;
          lastFinalRef.current = text;
          onFinalRef.current(text, confidence);
          interim = '';
        } else {
          interim += text;
        }
      }
      setState((prev) => ({ ...prev, interimTranscript: interim, lastConfidence: event.results[event.results.length - 1]?.[0]?.confidence ?? prev.lastConfidence }));
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setState((prev) => ({
        ...prev,
        isListening: false,
        error:
          event.error === 'not-allowed'
            ? 'Microphone permission denied. Allow mic access and reload.'
            : `Speech recognition error: ${event.error}`,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
      scheduleRestart(400);
    };

    recognitionRef.current = recognition;

    return () => {
      clearRestartTimer();
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [lang, scheduleRestart, clearRestartTimer]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    clearRestartTimer();

    if (!enabled || paused) {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      setState((prev) => ({ ...prev, isListening: false, interimTranscript: '' }));
      return;
    }

    lastFinalRef.current = '';
    scheduleRestart(200);
  }, [enabled, paused, scheduleRestart, clearRestartTimer]);

  const stop = useCallback(() => {
    clearRestartTimer();
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setState((prev) => ({ ...prev, isListening: false, interimTranscript: '' }));
  }, [clearRestartTimer]);

  return { ...state, stop };
}
