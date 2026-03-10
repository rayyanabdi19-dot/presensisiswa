import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Scanner from "./pages/Scanner";
import History from "./pages/History";
import ScheduleSettings from "./pages/ScheduleSettings";
import SchoolProfile from "./pages/SchoolProfile";
import Reports from "./pages/Reports";
import Classes from "./pages/Classes";
import Install from "./pages/Install";
import License from "./pages/License";
import Login from "./pages/Login";
import ManageUsers from "./pages/ManageUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Memuat...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/siswa" element={<Students />} />
              <Route path="/scan" element={<Scanner />} />
              <Route path="/kelas" element={<Classes />} />
              <Route path="/atur-jam" element={<ScheduleSettings />} />
              <Route path="/laporan" element={<Reports />} />
              <Route path="/riwayat" element={<History />} />
              <Route path="/profil-sekolah" element={<SchoolProfile />} />
              <Route path="/install" element={<Install />} />
              <Route path="/lisensi" element={<License />} />
              <Route path="/pengguna" element={<ManageUsers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
