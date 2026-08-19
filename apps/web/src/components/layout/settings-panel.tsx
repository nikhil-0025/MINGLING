"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { X, Shield, Check, Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { session, updateNickname } = useSession();
  const { theme, setTheme } = useTheme();
  const [nickname, setNickname] = useState(session?.nickname || "");
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    await updateNickname(nickname.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md vercel-card p-6 rounded-2xl border border-border bg-card text-card-foreground relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-base font-bold text-foreground tracking-tight">Session Settings</h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Customize display name & theme preferences</p>

        <form onSubmit={handleSaveNickname} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
              Display Nickname
            </label>
            <div className="flex gap-2">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter new nickname..."
                className="bg-background border-border text-foreground placeholder:text-muted-foreground text-sm h-9 rounded-lg"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 px-4 rounded-lg shrink-0"
              >
                Save
              </Button>
            </div>
            {savedNotice && (
              <p className="text-[11px] font-mono text-emerald-500 mt-1.5 flex items-center gap-1">
                <Check className="h-3 w-3" /> Nickname updated!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
              Appearance Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  theme === "system"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <Laptop className="h-4 w-4" /> System
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Privacy & Session Details</span>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground space-y-1">
              <p>Username: {session?.username}</p>
              <p>Session ID: {session?.sessionId}</p>
              <p>Expires: {session?.expiresAt ? new Date(session.expiresAt).toLocaleTimeString() : "24h"}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
