"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, Users, Hash, Copy, Check, Shield, User, Circle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRoom } from "@/hooks/use-room";
import { useSession } from "@/contexts/session-context";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function ChatSidebar() {
  const { session, endSession } = useSession();
  const { rooms, currentRoom, onlineUsers, createRoom, joinRoom, leaveRoom, setCurrentRoom } = useRoom();
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [sidebarError, setSidebarError] = useState<string | null>(null);

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    setSidebarError(null);
    createRoom(newRoomName.trim());
    setNewRoomName("");
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    setSidebarError(null);
    setIsJoining(true);
    try {
      await joinRoom(joinCode.trim().toUpperCase());
      setJoinCode("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Verify code and try again.";
      setSidebarError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <aside className="flex h-full w-80 flex-col bg-card border-r border-border text-card-foreground">
      {/* Session User Profile Box */}
      <div className="p-4 border-b border-border bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img src={session?.avatar} alt="User avatar" className="h-9 w-9 rounded-full bg-muted border border-border" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">
              {session?.nickname || session?.username || "Anonymous"}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span>Session: {session?.sessionId?.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Action Input Forms */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="New room name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
              className="h-8 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md focus:border-ring"
            />
            <Button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim()}
              size="sm"
              className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 font-medium rounded-md"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="XXXX-XXXX"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  if (sidebarError) setSidebarError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                className="h-8 pl-8 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground uppercase font-mono rounded-md focus:border-ring"
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              disabled={isJoining || !joinCode.trim()}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs border-border bg-background hover:bg-accent text-foreground shrink-0 rounded-md"
            >
              {isJoining ? "..." : "Join"}
            </Button>
          </div>

          {sidebarError && (
            <p className="text-[11px] font-mono text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span className="truncate">{sidebarError}</span>
            </p>
          )}
        </div>
      </div>

      {/* Active Rooms List */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
        <span>Active Rooms ({rooms.length})</span>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          <AnimatePresence>
            {rooms.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-muted-foreground border border-dashed border-border rounded-xl my-2">
                No active rooms. Create or join one to begin messaging.
              </div>
            ) : (
              rooms.map((room) => {
                const isActive = currentRoom?.id === room.id;
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onClick={() => setCurrentRoom(room)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all cursor-pointer",
                      isActive
                        ? "bg-accent text-accent-foreground border border-border shadow-sm font-semibold"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-mono font-bold",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"
                    )}>
                      #
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-foreground">
                        {room.name}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                        <span>Code: {room.code}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(room.code);
                      }}
                      className="opacity-0 group-hover:opacity-100 shrink-0 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                      title="Copy room code"
                    >
                      {copiedCode === room.code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Online Users Section */}
      {currentRoom && onlineUsers.length > 0 && (
        <div className="border-t border-border p-3 bg-muted/20">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
            <span>Online In Room ({onlineUsers.length})</span>
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {onlineUsers.map((user) => (
              <div key={user.userId} className="flex items-center gap-2 text-xs text-foreground">
                <img src={user.avatar} alt="" className="h-5 w-5 rounded-full bg-muted border border-border" />
                <span className="truncate">{user.username}</span>
                {user.userId === session?.sessionId && (
                  <span className="text-[10px] text-muted-foreground font-mono">(you)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-border flex items-center gap-2 bg-card">
        <Button
          onClick={() => {
            leaveRoom();
            endSession();
          }}
          variant="ghost"
          size="sm"
          className="flex-1 h-9 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md justify-center"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" /> End Session
        </Button>
        <ThemeToggle />
      </div>
    </aside>
  );
}