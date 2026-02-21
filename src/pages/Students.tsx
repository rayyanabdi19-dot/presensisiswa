import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Plus, Trash2, QrCode, X } from "lucide-react";
import { getStudents, addStudent, deleteStudent, Student } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Students() {
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [showAdd, setShowAdd] = useState(false);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: "", class: "", nisn: "" });

  const handleAdd = () => {
    if (!form.name || !form.class || !form.nisn) return;
    addStudent(form);
    setStudents(getStudents());
    setForm({ name: "", class: "", nisn: "" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setStudents(getStudents());
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Siswa</h2>
          <p className="text-muted-foreground">{students.length} siswa terdaftar</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
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
              <Input
                placeholder="Nama Lengkap"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Kelas (cth: XII IPA 1)"
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
              />
              <Input
                placeholder="NISN"
                value={form.nisn}
                onChange={(e) => setForm({ ...form, nisn: e.target.value })}
              />
              <Button onClick={handleAdd} className="w-full">
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between rounded-xl bg-card border border-border p-4 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.class}</p>
              <p className="text-xs text-muted-foreground">NISN: {student.nisn}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQrStudent(student)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <QrCode className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(student.id)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      <Dialog open={!!qrStudent} onOpenChange={() => setQrStudent(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code Siswa</DialogTitle>
          </DialogHeader>
          {qrStudent && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-xl border border-border bg-background p-4">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
