import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import Feeds from "./pages/Feeds";
import Health from "./pages/Health";
import Production from "./pages/Production";
import Financial from "./pages/Financial";
import SystemMonitoringDashboard from "./components/SystemMonitoringDashboard";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppInner() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/animals" element={<Animals />} />
                      <Route path="/feeds" element={<Feeds />} />
                      <Route path="/health" element={<Health />} />
                      <Route path="/production" element={<Production />} />
                      <Route path="/financial" element={<Financial />} />
                      <Route path="/monitoring" element={<SystemMonitoringDashboard />} />
                    </Routes>
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </ErrorBoundary>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </QueryClientProvider>
  );
}
