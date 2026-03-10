import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import StatCard from "@/components/StatCard";
import { getStudents, getTodayRecords, type Student, type AttendanceRecord } from "@/lib/supabase-store";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        () => { loadData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const hadir = todayRecords.filter((r) => r.status === "hadir").length;
  const izinSakit = todayRecords.filter((r) => r.status === "izin" || r.status === "sakit").length;
  const belum = students.length - todayRecords.length;

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  if (loading) return <div className="flex justify-center py-20 text-muted-foreground">Memuat data...</div>;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">{today}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Siswa" value={students.length} variant="primary" />
        <StatCard icon={UserCheck} label="Hadir" value={hadir} variant="success" />
        <StatCard icon={Clock} label="Izin/Sakit" value={izinSakit} variant="warning" />
        <StatCard icon={UserX} label="Belum Absen" value={belum} variant="destructive" />
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold text-foreground">Absensi Hari Ini</h3>
        </div>
        {todayRecords.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground">
            Belum ada siswa yang absen hari ini.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {todayRecords.map((record) => {
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
          </div>
        )}
      </div>
    </div>
  );
}
