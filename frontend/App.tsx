import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/feeds" element={<Feeds />} />
              <Route path="/health" element={<Health />} />
              <Route path="/production" element={<Production />} />
              <Route path="/financial" element={<Financial />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
        <Toaster />
      </ErrorBoundary>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
