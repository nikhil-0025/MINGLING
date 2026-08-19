"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Shield, Zap, Globe, ArrowRight, Sparkles, Hash, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function LandingPage() {
  const { createSession, isLoading, isAuthenticated } = useSession();
  const router = useRouter();
  const [nicknameInput, setNicknameInput] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (roomCodeInput.trim()) {
        router.push(`/chat?code=${encodeURIComponent(roomCodeInput.trim().toUpperCase())}`);
      } else {
        router.push("/chat");
      }
    }
  }, [isAuthenticated, router, roomCodeInput]);

  const handleStartSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsCreating(true);

    try {
      const success = await createSession(nicknameInput.trim() || undefined);
      if (!success) {
        setErrorMessage("Could not initialize session. Please check your connection.");
      }
    } catch {
      setErrorMessage("Could not initialize session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-muted selection:text-foreground overflow-hidden">
      {/* Vercel Ambient Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-zinc-500/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-border backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Mingling</span>
          <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full text-[11px] font-mono">v1.0</span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button
              onClick={() => router.push("/chat")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium rounded-lg text-sm px-4 h-9"
            >
              Open Workspace <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => handleStartSession()}
              disabled={isLoading || isCreating}
              variant="outline"
              className="border-border bg-card hover:bg-muted text-foreground text-sm h-9 px-4 rounded-lg"
            >
              Quick Join
            </Button>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full vercel-badge text-xs font-mono mb-8">
            <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
            <span>Ephemeral Sessions • Zero Logs</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Instant Chat. <br />
            <span className="gradient-text">Zero Footprint.</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            Privacy-first room messaging platform. No logins, no databases tracking your activity.
            Create temporary encrypted sessions and chat in real-time.
          </p>

          {/* Quick Interactive Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-10 max-w-md mx-auto vercel-card p-6 rounded-2xl text-left border border-zinc-800"
          >
            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Display Nickname (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Alex"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-lg text-sm focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Room Code (Optional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="XXXX-XXXX"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 pl-9 h-10 rounded-lg text-sm uppercase tracking-wider font-mono focus:border-zinc-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isCreating}
                className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg text-sm transition-all shadow-md"
              >
                {isCreating ? "Initializing Session..." : "Start Instant Chat"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {errorMessage ? (
              <p className="mt-3 text-xs text-red-400 font-mono text-center">{errorMessage}</p>
            ) : null}
          </motion.div>

          {/* Quick Metrics Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Real-Time Socket.IO</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Auto Redis Cache</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>24h Auto Expiry</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-28 grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: <Shield className="h-5 w-5 text-white" />,
              title: "Anonymous & Ephemeral",
              desc: "No accounts or passwords. Sessions expire automatically and leave no residual footprint.",
            },
            {
              icon: <Zap className="h-5 w-5 text-white" />,
              title: "Ultra Low Latency",
              desc: "Engineered on Socket.IO and Redis pub-sub for sub-millisecond message delivery.",
            },
            {
              icon: <Lock className="h-5 w-5 text-white" />,
              title: "Private Room Codes",
              desc: "Generate 8-digit unique room keys or QR codes to bring collaborators together instantly.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="vercel-card p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all group"
            >
              <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">{item.title}</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs font-mono text-zinc-600">
        <p>© {new Date().getFullYear()} Mingling • Designed with Vercel UI Principles</p>
      </footer>
    </div>
  );
}