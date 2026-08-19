"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onSend: (blob: Blob) => void;
}

export function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStart = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        onSend(blob);
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setMediaRecorder(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {isRecording && (
        <span className="text-[10px] font-mono text-red-400 animate-pulse px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800">
          REC {recordTime}s
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleStart}
        className={`shrink-0 h-9 w-9 rounded-lg transition-colors ${
          isRecording
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
        }`}
        title={isRecording ? "Stop Recording" : "Record Voice Note"}
      >
        {isRecording ? <Square className="h-3.5 w-3.5 fill-red-400" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  );
}
