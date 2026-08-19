export interface Session {
  sessionId: string;
  username: string;
  avatar: string;
  nickname: string | null;
  token: string;
  expiresAt: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  isPrivate: boolean;
  createdBy?: string;
  createdAt?: string | Date;
  expiresAt?: string | Date | null;
  participants: string[];
  maxParticipants: number;
  metadata?: Record<string, unknown>;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'system';
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  replyTo?: string | null;
  status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  createdAt: string | Date;
}

export interface OnlineUser {
  userId: string;
  username: string;
  avatar: string;
}

export interface TypingUser {
  userId: string;
  username: string;
}