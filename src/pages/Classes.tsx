import { useState, useEffect } from "react";
import { Plus, Trash2, Users, BookOpen } from "lucide-react";
import { getStudents, getClasses, addClass, deleteClass, type Student, type ClassInfo } from "@/lib/supabase-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function Classes() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", waliKelas: "" });

  const load = async () => {
    const [c, s] = await Promise.all([getClasses(), getStudents()]);
    setClasses(c); setStudents(s); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name) return;
    await addClass({ name: form.name, waliKelas: form.waliKelas });
    await load();
    setForm({ name: "", waliKelas: "" });
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    await deleteClass(id);
    await load();
  };

  const getStudentCount = (className: string) => students.filter((s) => s.class === className).length;

  if (loading) return <div className="flex justify-center py-20 text-muted-foreground">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Kelas</h2>
          <p className="text-muted-foreground">{classes.length} kelas terdaftar</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Tambah Kelas</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Kelas Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Nama Kelas (cth: XII IPA 3)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Wali Kelas" value={form.waliKelas} onChange={(e) => setForm({ ...form, waliKelas: e.target.value })} />
              <Button onClick={handleAdd} className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div key={cls.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="font-semibold text-foreground">{cls.name}</p>
                  <p className="text-sm text-muted-foreground">{cls.waliKelas || "—"}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(cls.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /><span>{getStudentCount(cls.name)} siswa</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
