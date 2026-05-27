// Main application dependencies
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { TooltipProvider } from "@/components/ui/tooltip";

// Page imports
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ApplicationsList from "./pages/ApplicationsList";
import ApplicationDetail from "./pages/ApplicationDetail";
import ApplicationForm from "./pages/ApplicationForm";
import Resumes from "./pages/Resumes";
import NotFound from "./pages/NotFound";
import Analyze from "./pages/Analyze";

const queryClient = new QueryClient();

export default function App() {
  return (
    // Provider wrappers (outer to inner):
    // 1. QueryClientProvider - TanStack Query for API caching
    // 2. AuthProvider - Authentication context
    // 3. TooltipProvider - UI component context
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          {/* React Router setup */}
          <BrowserRouter>
            <Routes>
              {/* Public routes (no auth required) */}
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes (auth required) */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><ApplicationsList /></ProtectedRoute>} />
              <Route path="/applications/new" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
              <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
              <Route path="/applications/:id/edit" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
              <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
              
              {/* Your Analyze page - requires authentication */}
              <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
              
              {/* 404 catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
