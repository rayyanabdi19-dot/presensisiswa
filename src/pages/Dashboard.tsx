import { useState, useEffect } from "react";
import {
  Users, UserCheck, UserX, Clock, ScanLine, TrendingUp,
  Calendar, BarChart3, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { getStudents, getTodayRecords, type Student, type AttendanceRecord } from "@/lib/supabase-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [s, r] = await Promise.all([getStudents(), getTodayRecords()]);
    setStudents(s);
    setTodayRecords(r);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, () => { loadData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const hadir = todayRecords.filter((r) => r.status === "hadir").length;
  const izinSakit = todayRecords.filter((r) => r.status === "izin" || r.status === "sakit").length;
  const alpha = todayRecords.filter((r) => r.status === "alpha").length;
  const belum = students.length - todayRecords.length;
  const persentaseHadir = students.length > 0 ? Math.round((hadir / students.length) * 100) : 0;

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const jam = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-20 text-muted-foreground">Memuat data...</div>;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header Greeting */}
      <div className="rounded-xl bg-primary p-6 text-primary-foreground shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-primary-foreground/70">Selamat datang,</p>
            <h2 className="text-2xl font-bold">{profile?.full_name || "Admin"}</h2>
            <p className="mt-1 text-sm text-primary-foreground/80">{today} • {jam}</p>
          </div>
          <div className="hidden md:flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <ScanLine className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Siswa" value={students.length} variant="primary" />
        <StatCard icon={UserCheck} label="Hadir" value={hadir} variant="success" />
        <StatCard icon={Clock} label="Izin/Sakit" value={izinSakit} variant="warning" />
        <StatCard icon={UserX} label="Belum Absen" value={belum} variant="destructive" />
      </div>

      {/* Quick Actions + Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Attendance Progress */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Progres Hari Ini</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-foreground">{persentaseHadir}%</span>
              <span className="text-sm text-muted-foreground">kehadiran</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${persentaseHadir}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{hadir} hadir</span>
              <span>{izinSakit} izin/sakit</span>
              <span>{alpha} alpha</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Aksi Cepat</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/scan">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <ScanLine className="h-6 w-6 text-primary" />
                <span className="text-xs">Scan QR</span>
              </Button>
            </Link>
            <Link to="/siswa">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-xs">Data Siswa</span>
              </Button>
            </Link>
            <Link to="/laporan">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-xs">Laporan</span>
              </Button>
            </Link>
            <Link to="/riwayat">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Clock className="h-6 w-6 text-primary" />
                <span className="text-xs">Riwayat</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Records */}
      <div className="rounded-xl bg-card border border-border shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-semibold text-foreground">Absensi Hari Ini</h3>
          {todayRecords.length > 0 && (
            <Link to="/riwayat" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {todayRecords.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <ScanLine className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Belum ada siswa yang absen hari ini.</p>
            <Link to="/scan">
              <Button variant="outline" size="sm" className="mt-3">
                <ScanLine className="mr-2 h-4 w-4" /> Mulai Scan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {todayRecords.slice(0, 10).map((record) => {
              const student = students.find((s) => s.id === record.studentId);
              return (
                <div key={record.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-foreground">{student?.name ?? "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{student?.class}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{record.time}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      record.status === "hadir" ? "bg-success/10 text-success"
                        : record.status === "alpha" ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
            {todayRecords.length > 10 && (
              <div className="px-5 py-3 text-center">
                <Link to="/riwayat" className="text-sm text-primary hover:underline">
                  +{todayRecords.length - 10} lainnya
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
