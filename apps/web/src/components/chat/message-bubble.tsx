"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck, Clock, AlertCircle, UserPlus, LogOut, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatTimeAgo } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

const statusIcons = {
  sending: <Clock className="h-3 w-3 text-muted-foreground" />,
  sent: <Check className="h-3 w-3 text-muted-foreground" />,
  delivered: <Check className="h-3 w-3 text-muted-foreground" />,
  seen: <CheckCheck className="h-3 w-3 text-sky-400" />,
  failed: <AlertCircle className="h-3 w-3 text-red-400" />,
};

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  if (message.type === "system") {
    const isJoined = message.content.toLowerCase().includes("joined");
    const isLeft = message.content.toLowerCase().includes("left");

    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center my-2.5 px-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/70 border border-border/80 text-xs font-mono text-muted-foreground shadow-xs backdrop-blur-sm">
          {isJoined ? (
            <UserPlus className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : isLeft ? (
            <LogOut className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          )}
          <span className="font-medium text-foreground">{message.content}</span>
          <span className="text-[10px] text-muted-foreground/70 ml-1">
            {formatTimeAgo(message.createdAt)}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn("flex gap-2.5 px-2 py-1", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {showAvatar && !isOwn ? (
        <Avatar className="h-7 w-7 mt-0.5 border border-border shrink-0">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-mono">
            {message.senderName?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-7 shrink-0" />
      )}

      <div className={cn("flex max-w-[75%] sm:max-w-[65%] flex-col", isOwn ? "items-end" : "items-start")}>
        {!isOwn && showAvatar && (
          <span className="mb-1 text-[11px] font-mono text-muted-foreground px-1">
            {message.senderName}
          </span>
        )}

        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-xs font-normal border border-primary"
              : "bg-card text-card-foreground rounded-tl-xs border border-border"
          )}
        >
          {message.replyTo && (
            <div className="mb-2 border-l-2 border-muted-foreground/50 pl-2 text-xs opacity-75 font-mono">
              Replying to message...
            </div>
          )}

          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Media attachments if present */}
          {message.fileUrl && (
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              {message.type === "image" || message.fileUrl.startsWith("data:image/") ? (
                <img src={message.fileUrl} alt="Attachment" className="max-h-60 w-full object-cover" />
              ) : message.type === "voice" || message.fileUrl.startsWith("data:audio/") ? (
                <audio controls src={message.fileUrl} className="w-full mt-1" />
              ) : (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs font-mono text-blue-500 hover:underline p-2"
                >
                  Download {message.fileName || "File"}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground px-1">
          <span>{formatTimeAgo(message.createdAt)}</span>
          {isOwn && statusIcons[message.status]}
        </div>
      </div>
    </motion.div>
  );
}