"use client";

import { useRouter } from "next/navigation";
import { Menu, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface MobileNavProps {
  onOpenSettings: () => void;
  onOpenSidebar: () => void;
}

export function MobileNav({ onOpenSettings, onOpenSidebar }: MobileNavProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
      <Button variant="ghost" size="icon" onClick={() => router.push('/') }>
        <Home className="h-5 w-5" />
      </Button>
      <div className="font-semibold text-foreground tracking-tight">Mingling</div>
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={() => onOpenSidebar()}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onOpenSettings()}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
