import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Plus, Trash2, QrCode, Download, MessageCircle, Pencil, Search } from "lucide-react";
import { getStudents, addStudent, deleteStudent, updateStudent, Student } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function Students() {
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", class: "", nisn: "", parentPhone: "" });
  const qrRef = useRef<HTMLDivElement>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.includes(search)
  );

  const resetForm = () => setForm({ name: "", class: "", nisn: "", parentPhone: "" });

  const handleAdd = () => {
    if (!form.name || !form.class || !form.nisn) return;
    addStudent({ name: form.name, class: form.class, nisn: form.nisn, parentPhone: form.parentPhone || undefined });
    setStudents(getStudents());
    resetForm();
    setShowAdd(false);
    toast.success("Siswa berhasil ditambahkan");
  };

  const handleEdit = () => {
    if (!editStudent || !form.name || !form.class || !form.nisn) return;
    updateStudent(editStudent.id, { name: form.name, class: form.class, nisn: form.nisn, parentPhone: form.parentPhone || undefined });
    setStudents(getStudents());
    resetForm();
    setEditStudent(null);
    toast.success("Data siswa berhasil diperbarui");
  };

  const openEdit = (student: Student) => {
    setForm({ name: student.name, class: student.class, nisn: student.nisn, parentPhone: student.parentPhone || "" });
    setEditStudent(student);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus siswa "${name}"?`)) return;
    deleteStudent(id);
    setStudents(getStudents());
    toast.success("Siswa berhasil dihapus");
  };

  const handleDownloadQR = () => {
    if (!qrRef.current || !qrStudent) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const padding = 40;
      const textHeight = 60;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2 + textHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(qrStudent.name, canvas.width / 2, img.height + padding + 24);
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#666666";
      ctx.fillText(`${qrStudent.class} • NISN: ${qrStudent.nisn}`, canvas.width / 2, img.height + padding + 46);

      const link = document.createElement("a");
      link.download = `QR-${qrStudent.name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
      toast.success("QR Code berhasil diunduh!");
    };
    img.src = url;
  };

  const sendWhatsApp = (student: Student, status: string) => {
    if (!student.parentPhone) {
      toast.error("Nomor WhatsApp orang tua belum diisi.");
      return;
    }
    const phone = student.parentPhone.replace(/^0/, "62").replace(/[^0-9]/g, "");
    const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const message = `Yth. Orang Tua/Wali dari *${student.name}*\n\nInformasi kehadiran:\n📅 ${today}\n📋 Status: *${status}*\n🏫 Kelas: ${student.class}\n\nTerima kasih.\n_Sistem Presensi Digital_`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Siswa</h2>
          <p className="text-muted-foreground">{students.length} siswa terdaftar</p>
        </div>
        <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Siswa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Siswa Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Kelas (cth: XII IPA 1)" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
              <Input placeholder="NISN" value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} />
              <Input placeholder="No. WhatsApp Orang Tua (cth: 08123456789)" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
              <Button onClick={handleAdd} className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama, kelas, atau NISN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead className="hidden sm:table-cell">No. WA Ortu</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {search ? "Tidak ada siswa yang cocok." : "Belum ada data siswa."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, idx) => (
                  <TableRow key={student.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="text-center text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {student.class}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{student.nisn}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {student.parentPhone || <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setQrStudent(student)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(student)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {student.parentPhone && (
                          <button
                            onClick={() => sendWhatsApp(student, "Hadir")}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"
                            title="Kirim WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editStudent} onOpenChange={(open) => { if (!open) { setEditStudent(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Siswa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Kelas" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
            <Input placeholder="NISN" value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} />
            <Input placeholder="No. WhatsApp Orang Tua" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
            <Button onClick={handleEdit} className="w-full">Perbarui</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!qrStudent} onOpenChange={() => setQrStudent(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code Siswa</DialogTitle>
          </DialogHeader>
          {qrStudent && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div ref={qrRef} className="rounded-xl border border-border bg-background p-4">
                <QRCodeSVG
                  value={JSON.stringify({ id: qrStudent.id, name: qrStudent.name, nisn: qrStudent.nisn })}
                  size={200}
                  level="M"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{qrStudent.name}</p>
                <p className="text-sm text-muted-foreground">{qrStudent.class} • NISN: {qrStudent.nisn}</p>
              </div>
              <Button onClick={handleDownloadQR} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
