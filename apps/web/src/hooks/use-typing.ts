"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from '@/contexts/socket-context';
import type { TypingUser } from '@/types';

export function useTyping(roomId: string | null) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !roomId) {
      setTypingUsers([]);
      return;
    }

    const handleTypingStarted = ({ userId, username }: TypingUser & { roomId: string }) => {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
    };

    const handleTypingStopped = ({ userId }: { userId: string; roomId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on('typing:started', handleTypingStarted);
    socket.on('typing:stopped', handleTypingStopped);

    return () => {
      socket.off('typing:started', handleTypingStarted);
      socket.off('typing:stopped', handleTypingStopped);
    };
  }, [socket, roomId]);

  const startTyping = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit('typing:start', { roomId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { roomId });
    }, 3000);
  }, [socket, roomId]);

  const stopTyping = useCallback(() => {
    if (!socket || !roomId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing:stop', { roomId });
  }, [socket, roomId]);

  return { typingUsers, startTyping, stopTyping };
}