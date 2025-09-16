'use client';

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "./ui/Button";

export function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleStartNewDay = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch('/api/cron/reset-harian', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || 'Gagal memulai hari baru.');
      }
      setMessage(data.message);
      // Optionally, refresh the page to show new data
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              Indah Cell Stock
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button
            onClick={handleStartNewDay}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Memproses..." : "Mulai Hari Baru"}
          </Button>
          <ThemeToggle />
        </div>
      </div>
      {message && <p className="text-center text-sm py-1 bg-secondary text-secondary-foreground">{message}</p>}
    </header>
  );
}
