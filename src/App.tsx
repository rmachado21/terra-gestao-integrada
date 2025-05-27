
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AreasPage from "./pages/areas/AreasPage";
import PlantiosPage from "./pages/plantios/PlantiosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Header />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-6">
                      <Index />
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
                    <main className="flex-1 p-6">
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
                    <main className="flex-1 p-6">
                      <PlantiosPage />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
