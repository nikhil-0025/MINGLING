"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '@/contexts/socket-context';
import type { Room, OnlineUser } from '@/types';

interface RoomContextType {
  rooms: Room[];
  currentRoom: Room | null;
  onlineUsers: OnlineUser[];
  isJoining: boolean;
  createRoom: (name: string, isPrivate?: boolean) => void;
  joinRoom: (roomIdOrCode: string) => Promise<void>;
  leaveRoom: () => void;
  setCurrentRoom: (room: Room | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isJoining, setIsJoining] = useState(false);

  const createRoom = useCallback(
    (name: string, isPrivate = false) => {
      if (!socket) return;
      socket.emit('room:create', { name, isPrivate });
    },
    [socket]
  );

  const joinRoom = useCallback(
    async (roomIdOrCode: string) => {
      const cleanCode = roomIdOrCode.trim();
      if (!cleanCode) return;

      setIsJoining(true);
      try {
        let roomData: any;
        try {
          const { data } = await axios.post(`/api/v1/rooms/join/${encodeURIComponent(cleanCode)}`);
          roomData = data.data;
        } catch (postErr) {
          // Fallback to GET room by ID if post join fails
          const { data } = await axios.get(`/api/v1/rooms/${encodeURIComponent(cleanCode)}`);
          roomData = data.data;
        }

        const room: Room = {
          id: roomData.id,
          name: roomData.name,
          code: roomData.code,
          isPrivate: roomData.isPrivate ?? false,
          createdBy: roomData.createdBy ?? '',
          createdAt: roomData.createdAt ?? new Date().toISOString(),
          maxParticipants: roomData.maxParticipants ?? 100,
          participants: Array.isArray(roomData.participants) ? roomData.participants : [],
        };

        setCurrentRoom(room);
        if (socket) {
          socket.emit('room:join', { roomId: room.id });
        }

        setRooms((prev) => {
          const existsIndex = prev.findIndex((r) => r.id === room.id);
          if (existsIndex >= 0) {
            const updated = [...prev];
            updated[existsIndex] = room;
            return updated;
          }
          return [...prev, room];
        });
      } catch (error) {
        console.error('Failed to join room:', error);
        throw error;
      } finally {
        setIsJoining(false);
      }
    },
    [socket]
  );

  const leaveRoom = useCallback(() => {
    if (!socket || !currentRoom) return;
    socket.emit('room:leave', { roomId: currentRoom.id });
    setCurrentRoom(null);
    setOnlineUsers([]);
  }, [socket, currentRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ room }: { room: Room }) => {
      setRooms((prev) => [...prev, room]);
      setCurrentRoom(room);
      socket.emit('room:join', { roomId: room.id });
    };

    const handleUserJoined = ({ userId, username, avatar, roomId }: OnlineUser & { roomId: string }) => {
      setOnlineUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, username, avatar }];
      });
    };

    const handleUserLeft = ({ userId }: { userId: string; roomId: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    const handleOnlineUsers = ({ users }: { roomId: string; users: OnlineUser[] }) => {
      setOnlineUsers(users);
    };

    socket.on('room:created', handleRoomCreated);
    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);
    socket.on('online:users', handleOnlineUsers);

    return () => {
      socket.off('room:created', handleRoomCreated);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
      socket.off('online:users', handleOnlineUsers);
    };
  }, [socket]);

  const value = useMemo(
    () => ({
      rooms,
      currentRoom,
      onlineUsers,
      isJoining,
      createRoom,
      joinRoom,
      leaveRoom,
      setCurrentRoom,
    }),
    [rooms, currentRoom, onlineUsers, isJoining, createRoom, joinRoom, leaveRoom]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
}
