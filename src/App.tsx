
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityProvider } from "@/components/SecurityProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import PageTransition from "@/components/PageTransition";
import LandingPage from "./pages/LandingPage";
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
import SubscriptionPage from "./pages/SubscriptionPage";
import AlertasPage from "./pages/alertas/AlertasPage";
import UsersPage from "./pages/admin/UsersPage";
import EditUserProfilePage from "./pages/admin/EditUserProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImpersonationBanner from "./components/admin/ImpersonationBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="h-screen bg-gray-50 flex flex-col">
    <Header />
    <ImpersonationBanner />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200 overflow-auto">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LoadingProvider>
          <AuthProvider>
            <ImpersonationProvider>
              <SecurityProvider>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Index />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProfilePage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SubscriptionPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/areas" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AreasPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/plantios" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PlantiosPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/colheitas" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ColheitasPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/processamento" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProcessamentoPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/estoque" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EstoquePage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/vendas" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <VendasPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <FinanceiroPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/alertas" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AlertasPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute requireSuperAdmin={true}>
                      <AppLayout>
                        <UsersPage />
                      </AppLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/users/:userId/edit" element={
                    <AdminRoute requireSuperAdmin={true}>
                      <AppLayout>
                        <EditUserProfilePage />
                      </AppLayout>
                    </AdminRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SecurityProvider>
            </ImpersonationProvider>
          </AuthProvider>
        </LoadingProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
