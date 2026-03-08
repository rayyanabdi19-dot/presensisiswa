import { useState, useEffect } from "react";
import { School, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSchoolProfile, saveSchoolProfile, type SchoolProfile } from "@/lib/supabase-store";

export default function SchoolProfilePage() {
  const [profile, setProfile] = useState<SchoolProfile>({
    name: "", npsn: "", address: "", phone: "", email: "", principal: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchoolProfile().then((p) => { setProfile(p); setLoading(false); });
  }, []);

  const handleSave = async () => {
    await saveSchoolProfile(profile);
    toast.success("Profil sekolah berhasil disimpan");
  };

  const update = (field: keyof SchoolProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="flex justify-center py-20 text-muted-foreground">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profil Sekolah</h2>
        <p className="text-muted-foreground">Informasi dasar sekolah</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4 pb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"><School className="h-7 w-7 text-primary" /></div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">NPSN: {profile.npsn}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Nama Sekolah</label><Input value={profile.name} onChange={(e) => update("name", e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">NPSN</label><Input value={profile.npsn} onChange={(e) => update("npsn", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><label className="text-sm font-medium text-foreground">Alamat</label><Textarea value={profile.address} onChange={(e) => update("address", e.target.value)} rows={2} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Telepon</label><Input value={profile.phone} onChange={(e) => update("phone", e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Email</label><Input value={profile.email} onChange={(e) => update("email", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><label className="text-sm font-medium text-foreground">Kepala Sekolah</label><Input value={profile.principal} onChange={(e) => update("principal", e.target.value)} /></div>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" />Simpan Perubahan</Button>
      </div>
    </div>
  );
}
