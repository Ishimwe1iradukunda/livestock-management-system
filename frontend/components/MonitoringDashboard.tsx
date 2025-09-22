import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PawPrint, 
  Heart, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Package,
  Calculator,
  Target,
  Zap,
  Activity
} from "lucide-react";
import backend from "~backend/client";

interface MonitoringDashboardProps {
  animalId?: number;
}

export default function MonitoringDashboard({ animalId }: MonitoringDashboardProps) {
  const [timeRange, setTimeRange] = useState("30"); // days
  const [selectedAnimal, setSelectedAnimal] = useState(animalId?.toString() || "");

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

  const { data: animalsData } = useQuery({
    queryKey: ["animals"],
    queryFn: () => backend.animals.list({ status: "active" }),
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["animal-metrics", selectedAnimal, timeRange],
    queryFn: () => selectedAnimal 
      ? backend.calculations.getAnimalMetrics({
          animalId: parseInt(selectedAnimal),
          startDate,
          endDate,
        })
      : null,
    enabled: !!selectedAnimal,
  });

  const { data: feedsData } = useQuery({
    queryKey: ["feeds-alerts"],
    queryFn: () => backend.feeds.list({ isActive: true }),
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => backend.reports.getDashboardStats(),
  });

  const lowStockFeeds = feedsData?.feeds.filter(feed => feed.needsReorder) || [];
  const alertsCount = lowStockFeeds.length + (dashboardStats?.upcomingHealthTasks || 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPerformanceColor = (value: number, threshold: number, inverted = false) => {
    const isGood = inverted ? value < threshold : value > threshold;
    return isGood ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Monitoring</h2>
          <p className="text-muted-foreground">Track key metrics and performance indicators</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          {!animalId && (
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select animal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All animals</SelectItem>
                {animalsData?.animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id.toString()}>
                    #{animal.tagNumber} - {animal.name || "Unnamed"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {alertsCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              System Alerts ({alertsCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockFeeds.length > 0 && (
                <div>
                  <p className="text-amber-700 font-medium mb-2">Low Stock Feeds:</p>
                  <div className="flex flex-wrap gap-2">
                    {lowStockFeeds.slice(0, 3).map((feed) => (
                      <Badge key={feed.id} variant="outline" className="text-amber-700 border-amber-300">
                        {feed.name}: {feed.quantityOnHand} {feed.unit}
                      </Badge>
                    ))}
                    {lowStockFeeds.length > 3 && (
                      <Badge variant="outline" className="text-amber-700 border-amber-300">
                        +{lowStockFeeds.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {(dashboardStats?.upcomingHealthTasks || 0) > 0 && (
                <div>
                  <p className="text-amber-700 font-medium">
                    {dashboardStats?.upcomingHealthTasks} health tasks due in next 30 days
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farm Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalAnimals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.activeAnimals || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feed Types</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedsData?.feeds.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockFeeds.length} need restock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(dashboardStats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dashboardStats?.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.recentHealthRecords || 0}</div>
            <p className="text-xs text-muted-foreground">Records last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Animal Metrics */}
      {selectedAnimal && metrics && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Animal Performance: #{metrics.animalTag}
              </CardTitle>
              <CardDescription>
                {metrics.animalName && `${metrics.animalName} • `}
                Performance metrics for the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Weight Gain</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.weightGain.toFixed(1)} kg</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.averageDailyGain.toFixed(2)} kg/day average
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Feed Efficiency</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.feedEfficiencyRatio.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">kg gain per kg feed</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cost/kg Gain</span>
                  </div>
                  <div className={`text-2xl font-bold ${getPerformanceColor(metrics.costPerKgGain, 10, true)}`}>
                    ${metrics.costPerKgGain.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Feed cost efficiency</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">ROI</span>
                  </div>
                  <div className={`text-2xl font-bold ${getPerformanceColor(metrics.roi, 0)}`}>
                    {metrics.roi.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Return on investment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Feed Costs:</span>
                  <span className="font-medium">{formatCurrency(metrics.feedCostTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Health Costs:</span>
                  <span className="font-medium">{formatCurrency(metrics.healthCostTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Production Value:</span>
                  <span className="font-medium text-green-600">{formatCurrency(metrics.productionValue)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Net Profit:</span>
                    <span className={`font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.netProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health & Nutrition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Feed Consumed:</span>
                  <span className="font-medium">{metrics.totalFeedConsumed.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Health Records:</span>
                  <span className="font-medium">{metrics.healthRecordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Vaccination Status:</span>
                  <Badge variant={metrics.vaccinationStatus === "Up to date" ? "default" : "destructive"}>
                    {metrics.vaccinationStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Days on Farm:</span>
                  <span className="font-medium">{metrics.daysOnFarm} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!selectedAnimal && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select an Animal</h3>
            <p className="text-muted-foreground text-center">
              Choose an animal from the dropdown above to view detailed performance metrics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}