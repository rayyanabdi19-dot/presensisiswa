import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Schedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  label: string;
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const STORAGE_KEY = "attendance_schedules";

function getSchedules(): Schedule[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data
    ? JSON.parse(data)
    : [
        { id: "1", day: "Senin", startTime: "07:00", endTime: "07:30", label: "Absensi Pagi" },
        { id: "2", day: "Senin", startTime: "12:00", endTime: "12:30", label: "Absensi Siang" },
      ];
}

function saveSchedules(s: Schedule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function ScheduleSettings() {
  const [schedules, setSchedules] = useState<Schedule[]>(getSchedules());
  const [day, setDay] = useState("Senin");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("07:30");
  const [label, setLabel] = useState("");

  const handleAdd = () => {
    if (!label) return;
    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      day,
      startTime,
      endTime,
      label,
    };
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    saveSchedules(updated);
    setLabel("");
  };

  const handleDelete = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Atur Jam Absensi</h2>
        <p className="text-muted-foreground">Kelola jadwal jam absensi per hari</p>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-foreground">Tambah Jadwal Baru</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger>
              <SelectValue placeholder="Hari" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <Input placeholder="Label (cth: Absensi Pagi)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Schedule list grouped by day */}
      {DAYS.map((d) => {
        const daySchedules = schedules.filter((s) => s.day === d);
        if (daySchedules.length === 0) return null;
        return (
          <div key={d} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/50 px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">{d}</h3>
            </div>
            <div className="divide-y divide-border">
              {daySchedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{s.label}</p>
                      <p className="text-sm text-muted-foreground">{s.startTime} – {s.endTime}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
