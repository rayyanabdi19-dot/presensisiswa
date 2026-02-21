import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, ScanLine } from "lucide-react";
import { addRecord, getStudents } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    setResult(null);
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText);
          scanner.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      );
      setScanning(true);
    } catch {
      setResult({ success: false, message: "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan." });
    }
  };

  const stopScanning = () => {
    scannerRef.current?.stop().catch(() => {});
    setScanning(false);
  };

  const handleScan = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      const students = getStudents();
      const student = students.find((s) => s.id === parsed.id);

      if (!student) {
        setResult({ success: false, message: "Siswa tidak ditemukan dalam database." });
        return;
      }

      const record = addRecord(student.id);
      if (record) {
        setResult({ success: true, message: `${student.name} berhasil diabsen pada ${record.time}` });
      } else {
        setResult({ success: false, message: `${student.name} sudah diabsen hari ini.` });
      }
    } catch {
      setResult({ success: false, message: "QR Code tidak valid." });
    }
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20 md:pb-0">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Scan QR Code</h2>
        <p className="text-muted-foreground">Arahkan kamera ke QR code siswa</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div id="qr-reader" className="w-full" ref={containerRef} />

        {!scanning && (
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <ScanLine className="h-10 w-10 text-primary" />
            </div>
            <Button onClick={startScanning} size="lg">
              Mulai Scan
            </Button>
          </div>
        )}

        {scanning && (
          <div className="p-4 text-center">
            <Button onClick={stopScanning} variant="outline">
              Berhenti Scan
            </Button>
          </div>
        )}
      </div>

      {result && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            result.success
              ? "border-success/30 bg-success/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
          ) : (
            <XCircle className="h-6 w-6 shrink-0 text-destructive" />
          )}
          <p className={`text-sm font-medium ${result.success ? "text-success" : "text-destructive"}`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
