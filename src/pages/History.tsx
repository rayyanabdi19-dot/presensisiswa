import { useState, useMemo } from "react";
import { getRecords, getStudents } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function History() {
  const [search, setSearch] = useState("");
  const students = getStudents();
  const records = getRecords().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter((r) => {
      const student = students.find((s) => s.id === r.studentId);
      return (
        student?.name.toLowerCase().includes(q) ||
        student?.class.toLowerCase().includes(q) ||
        r.date.includes(q)
      );
    });
  }, [records, students, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((r) => {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Riwayat Absensi</h2>
        <p className="text-muted-foreground">{records.length} total catatan</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama, kelas, atau tanggal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center text-muted-foreground shadow-sm">
          Belum ada riwayat absensi.
        </div>
      ) : (
        grouped.map(([date, items]) => (
          <div key={date} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/50 px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                {new Date(date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {items.map((record) => {
                const student = students.find((s) => s.id === record.studentId);
                return (
                  <div key={record.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="font-medium text-foreground">{student?.name ?? "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{student?.class}</p>
                      {record.keterangan && (
                        <p className="mt-0.5 text-xs text-muted-foreground italic">"{record.keterangan}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{record.time}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          record.status === "hadir"
                            ? "bg-success/10 text-success"
                            : record.status === "alpha"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
