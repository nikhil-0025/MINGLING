export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export interface ISession {
  id: string;
  sessionId: string;
  username: string;
  avatar: string;
  nickname: string | null;
  token: string;
  expiresAt: Date | string;
  createdAt?: Date | string;
  isActive?: boolean;
  lastSeen?: Date | string;
  ip?: string | null;
  userAgent?: string | null;
}

export interface IRoom {
  id: string;
  name: string;
  code: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt?: Date | string;
  expiresAt?: Date | null;
  participants?: string[];
  maxParticipants?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface IMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  replyTo?: string | null;
  status: MessageStatus;
  editedAt?: Date | null;
  createdAt: Date;
}

export interface OnlineUser {
  userId: string;
  username: string;
  avatar: string;
}

export interface ClientToServerEvents {
  'message:send': (payload: { roomId: string; content: string; replyTo?: string; type?: MessageType }) => void;
  'message:seen': (payload: { messageId: string; roomId: string }) => void;
  'room:create': (payload: { name: string; isPrivate?: boolean }) => void;
  'room:join': (payload: { roomId: string }) => void;
  'room:leave': (payload: { roomId: string }) => void;
  'typing:start': (payload: { roomId: string }) => void;
  'typing:stop': (payload: { roomId: string }) => void;
  'file:share': (payload: { roomId: string; fileUrl: string; fileName?: string; fileSize: number; mimeType: string }) => void;
  'ai:ask': (payload: { roomId: string; question: string }) => void;
  'ai:moderate': (payload: { roomId: string; messageId: string; content: string }) => void;
}

export interface ServerToClientEvents {
  'message:received': (payload: { message: IMessage; roomId: string }) => void;
  'message:updated': (payload: { messageId: string; status: MessageStatus }) => void;
  'room:created': (payload: { room: Omit<IRoom, 'participants' | 'metadata'> & { participants: number; createdAt: Date } }) => void;
  'user:joined': (payload: { userId: string; username: string; avatar: string; roomId: string }) => void;
  'user:left': (payload: { userId: string; roomId: string }) => void;
  'online:users': (payload: { roomId: string; users: OnlineUser[] }) => void;
  'typing:started': (payload: { userId: string; username: string; roomId: string }) => void;
  'typing:stopped': (payload: { userId: string; roomId: string }) => void;
  'message:flagged': (payload: { messageId: string; reason: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  username: string;
  avatar: string;
  sessionId: string;
}
