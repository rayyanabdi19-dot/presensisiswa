import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageUsers() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!profile?.is_admin) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email, password, full_name: fullName }),
      }
    );

    const result = await res.json();
    if (res.ok) {
      toast({ title: "Berhasil", description: `Pengguna ${email} berhasil dibuat` });
      setEmail("");
      setPassword("");
      setFullName("");
    } else {
      toast({ title: "Gagal", description: result.error, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Kelola Pengguna</h2>
        <p className="text-muted-foreground">Daftarkan pengguna baru ke sistem</p>
      </div>

      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label>Nama Lengkap</Label>
          <Input placeholder="Ahmad Guru" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" placeholder="guru@sekolah.id" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          <UserPlus className="mr-2 h-4 w-4" />
          {submitting ? "Membuat..." : "Buat Pengguna"}
        </Button>
      </form>
    </div>
  );
}
