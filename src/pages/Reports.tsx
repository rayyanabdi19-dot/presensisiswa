import { useMemo, useState } from "react";
import { format, parse, getMonth, getYear } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon, FileBarChart, Download } from "lucide-react";
import { getStudents, getRecords } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(25, 95%, 53%)", "hsl(0, 84%, 60%)"];

export default function Reports() {
  const students = getStudents();
  const records = getRecords();

  const classes = useMemo(() => [...new Set(students.map((s) => s.class))].sort(), [students]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const filteredStudents =
    selectedClass === "all" ? students : students.filter((s) => s.class === selectedClass);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (startDate && r.date < format(startDate, "yyyy-MM-dd")) return false;
      if (endDate && r.date > format(endDate, "yyyy-MM-dd")) return false;
      return true;
    });
  }, [records, startDate, endDate]);

  const stats = useMemo(() => {
    return filteredStudents.map((student) => {
      const studentRecords = filteredRecords.filter((r) => r.studentId === student.id);
      const hadir = studentRecords.filter((r) => r.status === "hadir").length;
      const izin = studentRecords.filter((r) => r.status === "izin").length;
      const sakit = studentRecords.filter((r) => r.status === "sakit").length;
      const alpha = studentRecords.filter((r) => r.status === "alpha").length;
      const total = studentRecords.length;
      const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
      return { student, hadir, izin, sakit, alpha, total, percentage };
    });
  }, [filteredStudents, filteredRecords]);

  const barData = useMemo(
    () =>
      stats.map(({ student, hadir, izin, sakit, alpha }) => ({
        name: student.name.split(" ")[0],
        Hadir: hadir,
        Izin: izin,
        Sakit: sakit,
        Alpha: alpha,
      })),
    [stats]
  );

  const pieData = useMemo(() => {
    const totals = stats.reduce(
      (acc, s) => ({
        hadir: acc.hadir + s.hadir,
        izin: acc.izin + s.izin,
        sakit: acc.sakit + s.sakit,
        alpha: acc.alpha + s.alpha,
      }),
      { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
    );
    return [
      { name: "Hadir", value: totals.hadir },
      { name: "Izin", value: totals.izin },
      { name: "Sakit", value: totals.sakit },
      { name: "Alpha", value: totals.alpha },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const monthlyData = useMemo(() => {
    const studentIds = new Set(filteredStudents.map((s) => s.id));
    const relevantRecords = filteredRecords.filter((r) => studentIds.has(r.studentId));

    const monthMap = new Map<string, { hadir: number; izin: number; sakit: number; alpha: number }>();

    relevantRecords.forEach((r) => {
      const d = parse(r.date, "yyyy-MM-dd", new Date());
      const key = `${getYear(d)}-${String(getMonth(d)).padStart(2, "0")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { hadir: 0, izin: 0, sakit: 0, alpha: 0 });
      }
      const m = monthMap.get(key)!;
      m[r.status]++;
    });

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [year, month] = key.split("-");
        const total = val.hadir + val.izin + val.sakit + val.alpha;
        const percentage = total > 0 ? Math.round((val.hadir / total) * 100) : 0;
        return {
          label: `${MONTH_NAMES[parseInt(month)]} ${year}`,
          ...val,
          total,
          percentage,
        };
      });
  }, [filteredStudents, filteredRecords]);

  const exportCSV = () => {
    const header = "Nama,Kelas,Hadir,Izin,Sakit,Alpha,Persentase";
    const rows = stats.map(({ student, hadir, izin, sakit, alpha, percentage }) =>
      `"${student.name}","${student.class}",${hadir},${izin},${sakit},${alpha},${percentage}%`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-absensi${selectedClass !== "all" ? `-${selectedClass}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Laporan Absensi</h2>
          <p className="text-muted-foreground">Rekap kehadiran per siswa</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4 mr-1" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Dari tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4 mr-1" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Sampai tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate ? date < startDate : false} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>
              Reset
            </Button>
          )}
          <Button onClick={exportCSV} disabled={stats.length === 0} variant="outline">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-12 shadow-sm">
          <FileBarChart className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Belum ada data.</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar Chart */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Grafik Kehadiran per Siswa</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="Hadir" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Izin" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sakit" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Alpha" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Distribusi Status Kehadiran</h3>
              {pieData.length === 0 ? (
                <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Belum ada data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Table */}
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
          {/* Monthly Recap */}
          {monthlyData.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Rekap Bulanan</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Bar Chart */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h4 className="mb-4 text-sm font-semibold text-foreground">Grafik Kehadiran per Bulan</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="hadir" name="Hadir" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="izin" name="Izin" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sakit" name="Sakit" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="alpha" name="Alpha" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Table */}
                <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Bulan</th>
                        <th className="px-4 py-3 text-center font-semibold text-success">Hadir</th>
                        <th className="px-4 py-3 text-center font-semibold text-warning">Izin</th>
                        <th className="px-4 py-3 text-center font-semibold text-warning">Sakit</th>
                        <th className="px-4 py-3 text-center font-semibold text-destructive">Alpha</th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">Total</th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {monthlyData.map((m) => (
                        <tr key={m.label} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{m.label}</td>
                          <td className="px-4 py-3 text-center">{m.hadir}</td>
                          <td className="px-4 py-3 text-center">{m.izin}</td>
                          <td className="px-4 py-3 text-center">{m.sakit}</td>
                          <td className="px-4 py-3 text-center">{m.alpha}</td>
                          <td className="px-4 py-3 text-center">{m.total}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                m.percentage >= 80
                                  ? "bg-success/10 text-success"
                                  : m.percentage >= 50
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {m.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}