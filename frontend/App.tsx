import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import Feeds from "./pages/Feeds";
import Health from "./pages/Health";
import Production from "./pages/Production";
import Financial from "./pages/Financial";
import UserManagement from "./pages/UserManagement";
import SystemMonitoringDashboard from "./components/SystemMonitoringDashboard";
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

function AppInner() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Router>
      <ErrorBoundary>
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
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <UserManagement />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </ErrorBoundary>
          </Layout>
        </ProtectedRoute>
        <Toaster />
      </ErrorBoundary>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </AuthProvider>
  );
}
