import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Scanner from "./pages/Scanner";
import History from "./pages/History";
import ScheduleSettings from "./pages/ScheduleSettings";
import SchoolProfile from "./pages/SchoolProfile";
import Reports from "./pages/Reports";
import Classes from "./pages/Classes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
