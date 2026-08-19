"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border border-border bg-card">
        <Sun className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className="h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-all transform rotate-0 hover:scale-110" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 transition-all transform rotate-0 hover:scale-110" />
      )}
    </Button>
  );
}
