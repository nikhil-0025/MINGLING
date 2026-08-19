"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from '@/contexts/socket-context';
import { useSession } from '@/contexts/session-context';
import axios from "axios";
import type { Message, Room } from '@/types';

export function useChat(roomId: string | null) {
  const { socket } = useSocket();
  const { session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    axios
      .get(`/api/v1/rooms/${roomId}/messages?limit=50`)
      .then(({ data }) => {
        setMessages(data.data.messages);
        setHasMore(data.data.pagination.total > 50);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleMessage = ({ message }: { message: Message; roomId: string }) => {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;

          const tempIndex = prev.findIndex(
            (m) =>
              m.id.startsWith('temp-') &&
              m.senderId === message.senderId &&
              m.content === message.content &&
              m.status === 'sending' &&
              m.roomId === message.roomId
          );

          if (tempIndex !== -1) {
            return prev.map((m, idx) => (idx === tempIndex ? message : m));
          }

          return [...prev, message];
        });
      }
    };

    const handleStatusUpdate = ({ messageId, status }: { messageId: string; status: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: status as Message['status'] } : m))
      );
    };

    socket.on('message:received', handleMessage);
    socket.on('message:updated', handleStatusUpdate);

    return () => {
      socket.off('message:received', handleMessage);
      socket.off('message:updated', handleStatusUpdate);
    };
  }, [socket, roomId]);

  const sendMessage = useCallback(
    (content: string, replyTo?: string) => {
      if (!socket || !roomId || !content.trim()) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        roomId,
        senderId: session?.sessionId || '',
        senderName: session?.nickname || session?.username || 'Anonymous',
        senderAvatar: session?.avatar || '',
        type: 'text',
        content: content.trim(),
        status: 'sending',
        createdAt: new Date().toISOString(),
        replyTo,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      socket.emit('message:send', {
        roomId,
        content: content.trim(),
        replyTo,
      });
    },
    [socket, roomId, session]
  );

  const markAsSeen = useCallback(
    (messageId: string) => {
      if (!socket || !roomId) return;
      socket.emit('message:seen', { messageId, roomId });
    },
    [socket, roomId]
  );

  return {
    messages,
    isLoading,
    hasMore,
    sendMessage,
    markAsSeen,
    messagesEndRef,
  };
}