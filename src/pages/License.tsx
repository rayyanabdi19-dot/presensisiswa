import { useState } from "react";
import { Shield, Key, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LICENSE_KEY = "license_data";

interface LicenseData {
  type: "trial" | "activated";
  startDate: string;
  key?: string;
}

// Valid license keys (in production this would be server-side)
const VALID_KEYS = [
  "ABSENSI-PRO-2025-XXAA",
  "ABSENSI-PRO-2025-XXBB",
  "ABSENSI-PRO-2025-XXCC",
  "ABSENSI-SCHOOL-PREM-01",
  "ABSENSI-SCHOOL-PREM-02",
];

function getLicense(): LicenseData {
  const data = localStorage.getItem(LICENSE_KEY);
  if (data) return JSON.parse(data);
  // Auto-start trial on first visit
  const trial: LicenseData = { type: "trial", startDate: new Date().toISOString() };
  localStorage.setItem(LICENSE_KEY, JSON.stringify(trial));
  return trial;
}

function saveLicense(license: LicenseData) {
  localStorage.setItem(LICENSE_KEY, JSON.stringify(license));
}

export function getTrialDaysLeft(): number {
  const license = getLicense();
  if (license.type === "activated") return -1; // -1 means activated
  const start = new Date(license.startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - diffDays);
}

export function isLicenseActive(): boolean {
  const license = getLicense();
  if (license.type === "activated") return true;
  return getTrialDaysLeft() > 0;
}

export default function License() {
  const [license, setLicense] = useState<LicenseData>(getLicense());
  const [inputKey, setInputKey] = useState("");
  const daysLeft = getTrialDaysLeft();
  const isActivated = license.type === "activated";

  const handleActivate = () => {
    const trimmed = inputKey.trim().toUpperCase();
    if (!trimmed) return;

    if (VALID_KEYS.includes(trimmed)) {
      const newLicense: LicenseData = { type: "activated", startDate: license.startDate, key: trimmed };
      saveLicense(newLicense);
      setLicense(newLicense);
      setInputKey("");
      toast.success("Lisensi berhasil diaktifkan! 🎉");
    } else {
      toast.error("Kunci lisensi tidak valid. Periksa kembali.");
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Lisensi Aplikasi</h2>
        <p className="text-muted-foreground">Kelola lisensi dan status aktivasi</p>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl border-2 p-6 ${
        isActivated 
          ? "border-success/30 bg-success/5" 
          : daysLeft > 7 
            ? "border-warning/30 bg-warning/5" 
            : "border-destructive/30 bg-destructive/5"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isActivated ? "bg-success/10" : daysLeft > 7 ? "bg-warning/10" : "bg-destructive/10"
          }`}>
            {isActivated ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : daysLeft > 0 ? (
              <Clock className="h-6 w-6 text-warning" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground">
              {isActivated ? "Lisensi Aktif" : daysLeft > 0 ? "Masa Uji Coba" : "Masa Uji Coba Berakhir"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isActivated
                ? "Aplikasi telah diaktivasi dengan lisensi penuh."
                : daysLeft > 0
                  ? `Sisa ${daysLeft} hari masa uji coba gratis.`
                  : "Masa uji coba 30 hari telah berakhir. Silakan aktivasi lisensi."}
            </p>
            {isActivated && license.key && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Kunci: {license.key.slice(0, 8)}••••••••
              </p>
            )}
          </div>
        </div>

        {!isActivated && daysLeft > 0 && (
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-warning transition-all"
                style={{ width: `${((30 - daysLeft) / 30) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground text-right">{30 - daysLeft}/30 hari terpakai</p>
          </div>
        )}
      </div>

      {/* Activation Form */}
      {!isActivated && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Aktivasi Lisensi</h3>
              <p className="text-sm text-muted-foreground">Masukkan kunci lisensi untuk mengaktifkan</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kunci lisensi..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleActivate()}
              className="font-mono uppercase"
            />
            <Button onClick={handleActivate} disabled={!inputKey.trim()}>
              <Shield className="mr-2 h-4 w-4" />
              Aktivasi
            </Button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
        <h3 className="font-semibold text-foreground">Informasi Lisensi</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Versi Aplikasi</span>
            <span className="font-medium text-foreground">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Tipe</span>
            <span className="font-medium text-foreground">{isActivated ? "Lisensi Penuh" : "Uji Coba (Trial)"}</span>
          </div>
          <div className="flex justify-between">
            <span>Mulai</span>
            <span className="font-medium text-foreground">
              {new Date(license.startDate).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          {!isActivated && (
            <div className="flex justify-between">
              <span>Berakhir</span>
              <span className="font-medium text-foreground">
                {new Date(new Date(license.startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
