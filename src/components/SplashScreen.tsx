import { useState, useEffect } from "react";
import { ScanLine } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1800);
    const timer2 = setTimeout(() => onFinish(), 2300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="animate-bounce">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-foreground/20 backdrop-blur-sm">
          <ScanLine className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-primary-foreground tracking-tight">
        Presensi Siswa
      </h1>
      <p className="mt-2 text-sm text-primary-foreground/70">
        Sistem Absensi Digital
      </p>
      <div className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-primary-foreground/20">
        <div className="h-full animate-[loading_1.5s_ease-in-out] bg-primary-foreground rounded-full" />
      </div>
    </div>
  );
}
