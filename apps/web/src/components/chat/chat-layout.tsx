"use client"

import { useState } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ProfileDrawer } from "@/components/layout/profile-drawer"
import { SettingsPanel } from "@/components/layout/settings-panel"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { useRoom } from "@/hooks/use-room"
import { cn } from "@/lib/utils"

export function ChatLayout() {
  const { currentRoom } = useRoom()
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <MobileNav
        onOpenSettings={() => setShowSettings(true)}
        onOpenSidebar={() => setShowSidebar(true)}
      />
      
      <div className="hidden lg:flex">
        <ChatSidebar />
      </div>
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card/50 backdrop-blur-xl transition-transform lg:hidden",
          showSidebar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ChatSidebar />
      </div>
      {showSidebar && (
        <button
          type="button"
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
        />
      )}
      
      <div className="flex flex-1 flex-col pt-14 lg:pt-0">
        <ChatWindow room={currentRoom} />
      </div>

      <div className="fixed top-2 right-2 z-30 lg:top-4 lg:right-4">
        <ThemeToggle />
      </div>

      <ProfileDrawer isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}