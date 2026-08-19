"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/contexts/session-context";
import { useRoom } from "@/hooks/use-room";
import { ChatLayout } from "@/components/chat/chat-layout";

function ChatContent() {
  const { isAuthenticated, isLoading } = useSession();
  const { joinRoom, currentRoom } = useRoom();
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && codeParam && (!currentRoom || currentRoom.code !== codeParam)) {
      joinRoom(codeParam).catch((err) => console.error("Auto-join failed:", err));
    }
  }, [isAuthenticated, codeParam, currentRoom, joinRoom]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="text-xs font-mono text-zinc-400">Validating Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <ChatLayout />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-xs font-mono text-zinc-400">Loading Workspace...</span>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}