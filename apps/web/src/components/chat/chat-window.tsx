"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { QRCodeDisplay } from "./qr-code-display";
import { useChat } from "@/hooks/use-chat";
import { useRoom } from "@/hooks/use-room";
import { useSession } from "@/contexts/session-context";
import { useSocket } from "@/contexts/socket-context";
import { Search, QrCode, MoreVertical, Plus, Hash, Share2, LogOut, Copy, Check, MessageSquare, AlertCircle } from "lucide-react";
import type { Room } from "@/types";

interface ChatWindowProps {
  room: Room | null;
}

export function ChatWindow({ room }: ChatWindowProps) {
  const { session } = useSession();
  const { createRoom, joinRoom, leaveRoom } = useRoom();
  const { isConnected } = useSocket();
  const { messages, isLoading, sendMessage, messagesEndRef } = useChat(room?.id || null);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    setActionError(null);
    setIsCreating(true);
    createRoom(newRoomName.trim());
    setNewRoomName("");
    setIsCreating(false);
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    setActionError(null);
    setIsJoining(true);
    try {
      await joinRoom(joinCode.trim().toUpperCase());
      setJoinCode("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Unable to join room. Verify code and try again.";
      setActionError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  if (!room) {
    return (
      <div className="relative flex flex-1 items-center justify-center bg-background text-foreground p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.05)_0,transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg vercel-card p-8 rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-md">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">Select or Create a Room</h3>
              <p className="text-xs font-mono text-muted-foreground">Anonymous • Ephemeral • Real-Time</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Join an existing room using an 8-digit access code or create a brand new temporary chat room.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Create Room
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Design Sync"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground text-sm h-9 rounded-lg"
                />
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !newRoomName.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 px-4 rounded-lg shrink-0"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Create
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Join with Room Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="XXXX-XXXX"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value);
                      if (actionError) setActionError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground pl-9 font-mono uppercase text-sm h-9 rounded-lg"
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !joinCode.trim()}
                  variant="outline"
                  className="border-border bg-background text-foreground hover:bg-accent text-xs font-medium h-9 px-4 rounded-lg shrink-0"
                >
                  {isJoining ? "Joining..." : "Join"}
                </Button>
              </div>
            </div>

            {actionError ? (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs font-mono text-red-500 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    );
  }

  const roomUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/chat?code=${room.code}`;

  const triggerCopyNotice = (text: string) => {
    setCopiedNotification(text);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleInvite = async () => {
    const inviteText = `Join room "${room.name}" on Mingling:\n${roomUrl}`;
    if (navigator.share) {
      await navigator.share({
        title: `Join ${room.name}`,
        text: inviteText,
        url: roomUrl,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(inviteText);
      triggerCopyNotice("Invite link copied to clipboard");
    }
    setShowActions(false);
  };

  const handleShareChat = async () => {
    const chatText = messages.map((msg) => `[${msg.senderName}]: ${msg.content}`).join("\n");
    const shareText = `Transcript from ${room.name}:\n\n${chatText}`;
    if (navigator.share) {
      await navigator.share({
        title: `Chat Transcript: ${room.name}`,
        text: shareText,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareText);
      triggerCopyNotice("Chat transcript copied to clipboard");
    }
    setShowActions(false);
  };

  const handleEndRoom = () => {
    leaveRoom();
    setShowActions(false);
  };

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground overflow-hidden">
      {/* Room Header */}
      <div className="relative z-20 flex items-center justify-between border-b border-border px-4 py-3 bg-card/80 backdrop-blur-xl lg:px-6">
        <div className="min-w-0 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center font-mono font-bold text-xs text-foreground">
            #
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
              <span>{room.name}</span>
              <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded text-[10px] font-mono">
                Code: {room.code}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mt-0.5">
              {isConnected ? (
                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Socket Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Reconnecting...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 bg-background border-border text-foreground placeholder:text-muted-foreground text-xs rounded-md focus:border-ring"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
            onClick={() => setShowSearch(!showSearch)}
            title="Search messages"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
            onClick={() => setShowQR(true)}
            title="QR Code Invite"
          >
            <QrCode className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
              onClick={() => setShowActions((prev) => !prev)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-muted text-left transition-colors"
                  onClick={handleInvite}
                >
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" /> Share Room Invite
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-muted text-left transition-colors"
                  onClick={handleShareChat}
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Copy Transcript
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 text-left transition-colors"
                  onClick={handleEndRoom}
                >
                  <LogOut className="h-3.5 w-3.5" /> Leave Room
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy Notification Pill */}
      {copiedNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-primary text-primary-foreground font-mono text-xs font-semibold shadow-xl flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Message Scroll View */}
      <ScrollArea className="flex-1 px-3 lg:px-6">
        <div className="py-6 space-y-2 max-w-4xl mx-auto">
          <AnimatePresence>
            {filteredMessages.map((msg, idx) => {
              const isOwn = msg.senderId === session?.sessionId;
              const showAvatar = idx === 0 || filteredMessages[idx - 1]?.senderId !== msg.senderId;
              return <MessageBubble key={msg.id} message={msg} isOwn={isOwn} showAvatar={showAvatar} />;
            })}
          </AnimatePresence>

          {filteredMessages.length === 0 && searchQuery && (
            <div className="text-center py-12 text-muted-foreground font-mono text-xs">
              No messages found matching "{searchQuery}"
            </div>
          )}

          {filteredMessages.length === 0 && !searchQuery && (
            <div className="text-center py-16 text-muted-foreground font-mono text-xs space-y-2">
              <p>Room initialized. Send a message to start the conversation.</p>
              <p className="text-[11px]">Share code <span className="text-foreground font-bold">{room.code}</span> with others to join.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing & Input Bar */}
      <TypingIndicator roomId={room.id} />
      <ChatInput roomId={room.id} onSend={sendMessage} disabled={!isConnected} />

      <QRCodeDisplay roomCode={room.code} isOpen={showQR} onClose={() => setShowQR(false)} />
    </div>
  );
}