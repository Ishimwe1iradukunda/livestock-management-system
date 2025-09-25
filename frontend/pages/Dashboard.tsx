import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PawPrint, Heart, TrendingUp, DollarSign, AlertTriangle, Plus, BarChart, Activity } from "lucide-react";
import backend from "~backend/client";
import MonitoringDashboard from "../components/MonitoringDashboard";
import FinancialDashboard from "../components/FinancialDashboard";
import StatisticsOverview from "../components/StatisticsOverview";
import AdvancedAnalyticsDashboard from "../components/AdvancedAnalyticsDashboard";
import AdvancedDataEntry from "../components/AdvancedDataEntry";
import RelatedLinks, { QuickActionLinks } from "../components/RelatedLinks";
import InternalLink from "../components/InternalLinkHelper";

export default function Dashboard() {
  const [showDataEntry, setShowDataEntry] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => backend.reports.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (showDataEntry) {
    return (
      <AdvancedDataEntry onClose={() => setShowDataEntry(false)} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of your livestock management system</p>
        </div>
        <Button onClick={() => setShowDataEntry(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Quick Add Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="analytics">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

          {/* Quick Actions Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Quick Actions</h2>
              <p className="text-muted-foreground text-sm">Common tasks to get you started</p>
            </div>
            <QuickActionLinks />
          </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAnimals || 0}</div>
            <p className="text-xs text-muted-foreground">
              <InternalLink to="/animals" variant="subtle" className="hover:underline">
                {stats?.activeAnimals || 0} active animals
              </InternalLink>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Records</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentHealthRecords || 0}</div>
            <p className="text-xs text-muted-foreground">
              <InternalLink to="/health" variant="subtle" className="hover:underline">
                Last 30 days
              </InternalLink>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProduction || 0}</div>
            <p className="text-xs text-muted-foreground">
              <InternalLink to="/production" variant="subtle" className="hover:underline">
                This month
              </InternalLink>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats?.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <InternalLink to="/financial" variant="subtle" className="hover:underline">
                This month
              </InternalLink>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RelatedLinks currentPage="dashboard" title="Explore Your Farm Data" />
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Summary</CardTitle>
            <CardDescription>Income and expenses for this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Income</span>
              <span className="text-green-600 font-semibold">
                <InternalLink to="/financial?type=income" variant="subtle" className="hover:underline">
                  {formatCurrency(stats?.monthlyIncome || 0)}
                </InternalLink>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expenses</span>
              <span className="text-red-600 font-semibold">
                <InternalLink to="/financial?type=expense" variant="subtle" className="hover:underline">
                  {formatCurrency(stats?.monthlyExpenses || 0)}
                </InternalLink>
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Net Profit</span>
                <span className={`font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.netProfit || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoringDashboard />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsOverview />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
