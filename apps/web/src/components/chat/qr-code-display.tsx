"use client";

import { useState } from "react";
import { Copy, Check, X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeDisplay({ roomCode, isOpen, onClose }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const roomUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/chat?code=${roomCode}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}&color=ffffff&bgcolor=09090b`;

  const copyUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm vercel-card p-6 rounded-2xl border border-zinc-800 text-white relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-white" />
          <h3 className="text-base font-bold text-white tracking-tight">Invite to Room</h3>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center my-4">
          <img
            src={qrCodeApiUrl}
            alt={`QR Code for room ${roomCode}`}
            className="w-48 h-48 rounded-lg border border-zinc-800 bg-zinc-900 p-2"
          />
          <p className="mt-3 text-xs font-mono text-zinc-400">Scan with mobile camera to join</p>
        </div>

        <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Room Access Code</span>
            <span className="font-mono font-bold text-sm text-white tracking-wider">{roomCode}</span>
          </div>
          <Button
            onClick={copyUrl}
            size="sm"
            className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold h-8 px-3 rounded-lg shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
