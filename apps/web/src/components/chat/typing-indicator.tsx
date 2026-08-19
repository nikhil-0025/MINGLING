"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTyping } from "@/hooks/use-typing";

interface TypingIndicatorProps {
  roomId: string | null;
}

export function TypingIndicator({ roomId }: TypingIndicatorProps) {
  const { typingUsers } = useTyping(roomId);

  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0].username} is typing...`
      : typingUsers.length === 2
      ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
      : `${typingUsers.length} people are typing...`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="flex items-center gap-2 px-4 py-1 text-[11px] font-mono text-zinc-400 max-w-4xl mx-auto"
      >
        <div className="flex gap-1 items-center">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: "300ms" }} />
        </div>
        <span>{text}</span>
      </motion.div>
    </AnimatePresence>
  );
}