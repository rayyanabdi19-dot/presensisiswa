import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center pb-20 md:pb-0">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          {isInstalled ? (
            <CheckCircle2 className="h-10 w-10 text-success" />
          ) : (
            <Smartphone className="h-10 w-10 text-primary" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isInstalled ? "Aplikasi Terinstall!" : "Install Aplikasi"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isInstalled
              ? "Aplikasi Presensi sudah terpasang di perangkat Anda."
              : "Install aplikasi Presensi Siswa ke perangkat Anda untuk akses cepat."}
          </p>
        </div>

        {!isInstalled && (
          <>
            {deferredPrompt ? (
              <Button onClick={handleInstall} size="lg" className="w-full">
                <Download className="mr-2 h-5 w-5" />
                Install Sekarang
              </Button>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 text-left space-y-3">
                <p className="text-sm font-medium text-foreground">Cara install manual:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>iPhone:</strong> Tap ikon Share (⬆️) → "Add to Home Screen"</p>
                  <p><strong>Android:</strong> Tap menu (⋮) → "Install app" atau "Add to Home Screen"</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
