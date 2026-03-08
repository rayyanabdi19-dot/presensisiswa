import { useState, useEffect } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getSchedules, addSchedule, deleteSchedule, type Schedule } from "@/lib/supabase-store";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function ScheduleSettings() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState("Senin");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("07:30");
  const [label, setLabel] = useState("");

  const load = async () => {
    const data = await getSchedules();
    setSchedules(data); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!label) return;
    await addSchedule({ day, startTime, endTime, label });
    await load();
    setLabel("");
  };

  const handleDelete = async (id: string) => {
    await deleteSchedule(id);
    await load();
  };

  if (loading) return <div className="flex justify-center py-20 text-muted-foreground">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Atur Jam Absensi</h2>
        <p className="text-muted-foreground">Kelola jadwal jam absensi per hari</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-foreground">Tambah Jadwal Baru</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger><SelectValue placeholder="Hari" /></SelectTrigger>
            <SelectContent>{DAYS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
          </Select>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <Input placeholder="Label (cth: Absensi Pagi)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" />Tambah</Button>
        </div>
      </div>
      {DAYS.map((d) => {
        const daySchedules = schedules.filter((s) => s.day === d);
        if (daySchedules.length === 0) return null;
        return (
          <div key={d} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/50 px-5 py-3"><h3 className="text-sm font-semibold text-foreground">{d}</h3></div>
            <div className="divide-y divide-border">
              {daySchedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Clock className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="font-medium text-foreground">{s.label}</p>
                      <p className="text-sm text-muted-foreground">{s.startTime} – {s.endTime}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
