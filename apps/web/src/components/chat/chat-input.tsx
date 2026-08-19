"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "./emoji-picker";
import { VoiceRecorder } from "./voice-recorder";
import { FileDropzone } from "./file-dropzone";
import { useTyping } from "@/hooks/use-typing";
import { useSocket } from "@/contexts/socket-context";

interface ChatInputProps {
  roomId: string | null;
  onSend: (content: string) => void;
  onSendFile?: (fileUrl: string, fileName: string, mimeType: string) => void;
  disabled?: boolean;
}

export function ChatInput({ roomId, onSend, onSendFile, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showDropzone, setShowDropzone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { startTyping, stopTyping } = useTyping(roomId);
  const { socket } = useSocket();

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
    stopTyping();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    if (value.trim()) startTyping();
    else stopTyping();
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleVoiceSend = (blob: Blob) => {
    if (!socket || !roomId) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      socket.emit("file:share", {
        roomId,
        fileUrl: base64Audio,
        fileName: "Voice Note.webm",
        fileSize: blob.size,
        mimeType: "audio/webm",
      });
    };
    reader.readAsDataURL(blob);
  };

  const handleFileShared = (fileUrl: string, fileName: string, mimeType: string) => {
    if (socket && roomId) {
      socket.emit("file:share", { roomId, fileUrl, fileName, fileSize: 0, mimeType });
    }
    setShowDropzone(false);
  };

  return (
    <div className="relative border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-xl p-3 lg:p-4">
      {showDropzone && <FileDropzone roomId={roomId || ""} onFileShared={handleFileShared} />}

      <div className="max-w-4xl mx-auto flex items-center gap-2">
        <EmojiPicker onSelect={handleEmojiSelect} />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDropzone(!showDropzone)}
          className="shrink-0 h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
          title="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <VoiceRecorder onSend={handleVoiceSend} />

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => stopTyping()}
            placeholder={disabled ? "Connecting socket..." : "Write a message..."}
            disabled={disabled}
            className="h-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 text-sm rounded-xl focus:border-zinc-500"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          size="icon"
          className="shrink-0 h-10 w-10 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all font-semibold disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}