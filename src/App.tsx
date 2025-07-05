
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProdutos from "@/pages/admin/AdminProdutos";
import AdminVendas from "@/pages/admin/AdminVendas";
import AdminClientes from "@/pages/admin/AdminClientes";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Página inicial pública */}
            <Route path="/" element={<Index />} />
            
            {/* Login do admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Rotas protegidas do admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="produtos" element={<AdminProdutos />} />
              <Route path="vendas" element={<AdminVendas />} />
              <Route path="clientes" element={<AdminClientes />} />
              <Route path="configuracoes" element={<div>Configurações em desenvolvimento</div>} />
            </Route>

            {/* Redirect para admin se não encontrar rota */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
