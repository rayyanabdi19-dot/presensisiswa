import { useMemo, useState } from "react";
import { getStudents, getRecords } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileBarChart } from "lucide-react";

export default function Reports() {
  const students = getStudents();
  const records = getRecords();

  const classes = useMemo(() => [...new Set(students.map((s) => s.class))].sort(), [students]);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const filteredStudents =
    selectedClass === "all" ? students : students.filter((s) => s.class === selectedClass);

  const stats = useMemo(() => {
    return filteredStudents.map((student) => {
      const studentRecords = records.filter((r) => r.studentId === student.id);
      const hadir = studentRecords.filter((r) => r.status === "hadir").length;
      const izin = studentRecords.filter((r) => r.status === "izin").length;
      const sakit = studentRecords.filter((r) => r.status === "sakit").length;
      const alpha = studentRecords.filter((r) => r.status === "alpha").length;
      const total = studentRecords.length;
      const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
      return { student, hadir, izin, sakit, alpha, total, percentage };
    });
  }, [filteredStudents, records]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Laporan Absensi</h2>
          <p className="text-muted-foreground">Rekap kehadiran per siswa</p>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {stats.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-12 shadow-sm">
          <FileBarChart className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Belum ada data.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Nama</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Kelas</th>
                <th className="px-4 py-3 text-center font-semibold text-success">Hadir</th>
                <th className="px-4 py-3 text-center font-semibold text-warning">Izin</th>
                <th className="px-4 py-3 text-center font-semibold text-warning">Sakit</th>
                <th className="px-4 py-3 text-center font-semibold text-destructive">Alpha</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.map(({ student, hadir, izin, sakit, alpha, percentage }) => (
                <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.class}</td>
                  <td className="px-4 py-3 text-center">{hadir}</td>
                  <td className="px-4 py-3 text-center">{izin}</td>
                  <td className="px-4 py-3 text-center">{sakit}</td>
                  <td className="px-4 py-3 text-center">{alpha}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        percentage >= 80
                          ? "bg-success/10 text-success"
                          : percentage >= 50
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
