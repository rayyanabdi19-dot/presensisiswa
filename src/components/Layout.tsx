import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ScanLine, ClipboardList, Clock,
  School, FileBarChart, BookOpen, Menu, X, Shield, LogOut, UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/siswa", icon: Users, label: "Siswa" },
  { to: "/scan", icon: ScanLine, label: "Scan QR" },
  { to: "/kelas", icon: BookOpen, label: "Kelas" },
  { to: "/atur-jam", icon: Clock, label: "Atur Jam" },
  { to: "/laporan", icon: FileBarChart, label: "Laporan" },
  { to: "/riwayat", icon: ClipboardList, label: "Riwayat" },
  { to: "/profil-sekolah", icon: School, label: "Profil Sekolah" },
  { to: "/lisensi", icon: Shield, label: "Lisensi" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();

  const allNavItems = profile?.is_admin
    ? [...navItems, { to: "/pengguna", icon: UserPlus, label: "Kelola Pengguna" }]
    : navItems;

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">QR</div>
            <h1 className="text-lg font-bold text-foreground">Absensi</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {allNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
              }>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 px-3 text-xs text-muted-foreground truncate">
            {profile?.full_name}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 backdrop-blur-md px-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground md:hidden">Absensi Siswa</h2>
        </header>
        <main className="flex-1 p-4 pb-6 md:p-6">{children}</main>
      </div>
    </div>
  );
}
