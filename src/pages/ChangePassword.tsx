import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChangePassword() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Gagal", description: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Gagal", description: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Password berhasil diubah" });
      setPassword("");
      setConfirm("");
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ganti Password</h2>
        <p className="text-muted-foreground">Ubah password akun Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="new-password">Password Baru</Label>
          <PasswordInput id="new-password" placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Konfirmasi Password</Label>
          <PasswordInput id="confirm-password" placeholder="Ulangi password baru" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          <KeyRound className="mr-2 h-4 w-4" />
          {submitting ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </form>
    </div>
  );
}
