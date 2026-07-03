import { useEffect, useRef, useState } from 'react';

export interface AudioMetrics {
  volume: number;
  clarity: number;
  isActive: boolean;
}

export function useAudioLevel(stream: MediaStream | null, enabled: boolean): AudioMetrics {
  const [metrics, setMetrics] = useState<AudioMetrics>({ volume: 0, clarity: 0, isActive: false });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !enabled) {
      setMetrics({ volume: 0, clarity: 0, isActive: false });
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack?.enabled) {
      setMetrics({ volume: 0, clarity: 0, isActive: false });
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;

    try {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(data);

        let sum = 0;
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
          if (data[i] > peak) peak = data[i];
        }

        const avg = sum / data.length;
        const volume = Math.min(100, Math.round((avg / 128) * 100));
        const clarity = Math.min(100, Math.round((peak / 255) * 100 + volume * 0.2));

        setMetrics({
          volume,
          clarity,
          isActive: volume > 3,
        });

        rafRef.current = requestAnimationFrame(tick);
      };

      void audioContext.resume();
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setMetrics({ volume: 0, clarity: 0, isActive: false });
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      void audioContext?.close();
    };
  }, [stream, enabled]);

  return metrics;
}
