
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityProvider } from "@/components/SecurityProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import AreasPage from "./pages/areas/AreasPage";
import PlantiosPage from "./pages/plantios/PlantiosPage";
import ColheitasPage from "./pages/colheitas/ColheitasPage";
import ProcessamentoPage from "./pages/processamento/ProcessamentoPage";
import EstoquePage from "./pages/estoque/EstoquePage";
import VendasPage from "./pages/vendas/VendasPage";
import FinanceiroPage from "./pages/financeiro/FinanceiroPage";
import UsersPage from "./pages/admin/UsersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SecurityProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <Index />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <ProfilePage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/areas" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <AreasPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/plantios" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <PlantiosPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/colheitas" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <ColheitasPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/processamento" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <ProcessamentoPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/estoque" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <EstoquePage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/vendas" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <VendasPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/financeiro" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <FinanceiroPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute requireSuperAdmin={true}>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                        <UsersPage />
                      </main>
                    </div>
                  </div>
                </AdminRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SecurityProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
