
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityProvider } from "@/components/SecurityProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import AlertasPage from "./pages/alertas/AlertasPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SecurityProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/areas" element={
                    <ProtectedRoute>
                      <AreasPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/plantios" element={
                    <ProtectedRoute>
                      <PlantiosPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/colheitas" element={
                    <ProtectedRoute>
                      <ColheitasPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/processamento" element={
                    <ProtectedRoute>
                      <ProcessamentoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/estoque" element={
                    <ProtectedRoute>
                      <EstoquePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendas" element={
                    <ProtectedRoute>
                      <VendasPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro" element={
                    <ProtectedRoute>
                      <FinanceiroPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/alertas" element={
                    <ProtectedRoute>
                      <AlertasPage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </BrowserRouter>
          </SecurityProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
