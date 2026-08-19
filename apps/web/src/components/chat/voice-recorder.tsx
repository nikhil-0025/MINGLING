"use client";

import { useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";

interface VoiceRecorderProps {
  onSend: (blob: Blob) => void;
}

export function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecorder();

  useEffect(() => {
    if (audioBlob) {
      onSend(audioBlob);
      clearRecording();
    }
  }, [audioBlob, onSend, clearRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex items-center gap-1">
      {isRecording && (
        <span className="text-[10px] font-mono text-red-400 animate-pulse px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800">
          REC {recordingTime}s
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleRecording}
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

