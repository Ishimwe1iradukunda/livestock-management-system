import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Users,
  Calendar,
  Zap,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import backend from "~backend/client";

export default function StatisticsOverview() {
  const [timeRange, setTimeRange] = useState("30");
  const [species, setSpecies] = useState<string>("");

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => backend.reports.getDashboardStats(),
  });

  const { data: animalsData } = useQuery({
    queryKey: ["animals", species],
    queryFn: () => backend.animals.list({ species: species || undefined, limit: 500 }),
  });

  const { data: healthData } = useQuery({
    queryKey: ["health-records", timeRange],
    queryFn: () => backend.health.list({ limit: 500 }),
  });

  const { data: productionData } = useQuery({
    queryKey: ["production-records", timeRange],
    queryFn: () => backend.production.list({ limit: 500 }),
  });

  const { data: feedingData } = useQuery({
    queryKey: ["feeding-records", timeRange],
    queryFn: () => backend.feeding.list({ limit: 500 }),
  });

  const { data: financialData } = useQuery({
    queryKey: ["financial-records", timeRange],
    queryFn: () => backend.financial.list({ limit: 500 }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate livestock statistics
  const animals = animalsData?.animals || [];
  const speciesBreakdown = animals.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusBreakdown = animals.reduce((acc, animal) => {
    acc[animal.status] = (acc[animal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageBreakdown = animals.reduce((acc, animal) => {
    if (animal.birthDate) {
      const ageInDays = Math.floor((Date.now() - new Date(animal.birthDate).getTime()) / (1000 * 60 * 60 * 24));
      const ageCategory = ageInDays < 90 ? 'Young' : ageInDays < 365 ? 'Juvenile' : ageInDays < 1825 ? 'Adult' : 'Senior';
      acc[ageCategory] = (acc[ageCategory] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate health statistics
  const healthRecords = healthData?.records || [];
  const recentHealthRecords = healthRecords.filter(record => {
    const recordDate = new Date(record.recordDate);
    return recordDate >= startDate && recordDate <= endDate;
  });

  const healthTypeBreakdown = recentHealthRecords.reduce((acc, record) => {
    acc[record.recordType] = (acc[record.recordType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageHealthCost = recentHealthRecords.length > 0 
    ? recentHealthRecords.reduce((sum, record) => sum + (record.cost || 0), 0) / recentHealthRecords.length
    : 0;

  // Calculate production statistics
  const productionRecords = productionData?.records || [];
  const recentProductionRecords = productionRecords.filter(record => {
    const recordDate = new Date(record.productionDate);
    return recordDate >= startDate && recordDate <= endDate;
  });

  const productionTypeBreakdown = recentProductionRecords.reduce((acc, record) => {
    acc[record.productType] = (acc[record.productType] || 0) + (record.quantity || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalProduction = Object.values(productionTypeBreakdown).reduce((sum, qty) => sum + qty, 0);
  const productionValue = recentProductionRecords.reduce((sum, record) => sum + (record.totalValue || 0), 0);

  // Calculate feeding statistics
  const feedingRecords = feedingData?.records || [];
  const recentFeedingRecords = feedingRecords.filter(record => {
    const recordDate = new Date(record.feedingDate);
    return recordDate >= startDate && recordDate <= endDate;
  });

  const totalFeedConsumed = recentFeedingRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
  const totalFeedCost = recentFeedingRecords.reduce((sum, record) => sum + (record.cost || 0), 0);

  // Calculate efficiency metrics
  const feedEfficiency = totalProduction > 0 && totalFeedConsumed > 0 ? totalProduction / totalFeedConsumed : 0;
  const profitPerAnimal = animals.length > 0 ? (dashboardStats?.netProfit || 0) / animals.length : 0;
  const healthCostPerAnimal = animals.length > 0 ? (averageHealthCost * recentHealthRecords.length) / animals.length : 0;

  const getSpeciesColor = (species: string) => {
    const colors = {
      'cattle': 'bg-brown-100 text-brown-800 border-brown-200',
      'sheep': 'bg-gray-100 text-gray-800 border-gray-200',
      'goat': 'bg-orange-100 text-orange-800 border-orange-200',
      'pig': 'bg-pink-100 text-pink-800 border-pink-200',
      'chicken': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[species.toLowerCase() as keyof typeof colors] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'sold': 'bg-blue-100 text-blue-800 border-blue-200',
      'deceased': 'bg-red-100 text-red-800 border-red-200',
      'quarantine': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Livestock Statistics</h2>
          <p className="text-muted-foreground">Comprehensive analytics and insights</p>
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
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All species</SelectItem>
              <SelectItem value="cattle">Cattle</SelectItem>
              <SelectItem value="sheep">Sheep</SelectItem>
              <SelectItem value="goat">Goat</SelectItem>
              <SelectItem value="pig">Pig</SelectItem>
              <SelectItem value="chicken">Chicken</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="livestock">Livestock</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {statusBreakdown.active || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(dashboardStats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dashboardStats?.netProfit || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(profitPerAnimal)}/animal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Production Value</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(productionValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalProduction.toFixed(1)} units total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentHealthRecords.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Records last {timeRange} days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feed Efficiency:</span>
                    <span className={`font-medium ${feedEfficiency > 0.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {feedEfficiency.toFixed(3)} ratio
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Health Cost/Animal:</span>
                    <span className="font-medium">
                      {formatCurrency(healthCostPerAnimal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Production/Day:</span>
                    <span className="font-medium text-blue-600">
                      {(totalProduction / parseInt(timeRange)).toFixed(2)} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Animal Rate:</span>
                    <span className={`font-medium ${((statusBreakdown.active || 0) / animals.length * 100) > 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {animals.length > 0 ? ((statusBreakdown.active || 0) / animals.length * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardStats?.upcomingHealthTasks || 0) > 0 ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">
                        {dashboardStats?.upcomingHealthTasks} health tasks due
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">All health tasks up to date</span>
                    </div>
                  )}
                  
                  {(statusBreakdown.quarantine || 0) > 0 ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">
                        {statusBreakdown.quarantine} animals in quarantine
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">No animals in quarantine</span>
                    </div>
                  )}

                  {feedEfficiency < 0.3 && totalFeedConsumed > 0 ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Low feed efficiency detected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Feed efficiency is good</span>
                    </div>
                  )}

                  {(dashboardStats?.netProfit || 0) < 0 ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Negative profit margin</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Positive profit margin</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="livestock" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Species Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(speciesBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([species, count]) => (
                      <div key={species} className="flex items-center justify-between">
                        <Badge className={getSpeciesColor(species)} variant="outline">
                          {species}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge className={getStatusColor(status)} variant="outline">
                          {status}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(ageBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([age, count]) => (
                      <div key={age} className="flex items-center justify-between">
                        <Badge variant="outline">
                          {age}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Production by Type
                </CardTitle>
                <CardDescription>Last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(productionTypeBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, quantity]) => (
                      <div key={type} className="flex items-center justify-between">
                        <Badge variant="outline">
                          {type}
                        </Badge>
                        <span className="font-medium">{quantity.toFixed(1)} units</span>
                      </div>
                    ))}
                  {Object.keys(productionTypeBreakdown).length === 0 && (
                    <p className="text-muted-foreground text-center">No production records found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Health Activity
                </CardTitle>
                <CardDescription>Last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(healthTypeBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <Badge variant="outline">
                          {type}
                        </Badge>
                        <span className="font-medium">{count} records</span>
                      </div>
                    ))}
                  {Object.keys(healthTypeBreakdown).length === 0 && (
                    <p className="text-muted-foreground text-center">No health records found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feed Efficiency</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedEfficiency.toFixed(3)}</div>
                <p className="text-xs text-muted-foreground">
                  {feedEfficiency > 0.5 ? 'Excellent' : feedEfficiency > 0.3 ? 'Good' : 'Needs improvement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Per Unit</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalProduction > 0 ? formatCurrency(totalFeedCost / totalProduction) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Feed cost per production unit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Per Animal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${profitPerAnimal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitPerAnimal)}
                </div>
                <p className="text-xs text-muted-foreground">Monthly average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Cost Ratio</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(dashboardStats?.monthlyIncome || 0) > 0 
                    ? ((averageHealthCost * recentHealthRecords.length) / (dashboardStats?.monthlyIncome || 1) * 100).toFixed(1)
                    : '0'
                  }%
                </div>
                <p className="text-xs text-muted-foreground">Of total income</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Efficiency Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedEfficiency < 0.3 && totalFeedConsumed > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Feed Efficiency Alert:</strong> Consider reviewing feed quality and feeding schedules. Current efficiency is below optimal levels.
                    </p>
                  </div>
                )}
                
                {(dashboardStats?.netProfit || 0) < 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>Profitability Alert:</strong> Current operations are running at a loss. Review expenses and consider optimizing feed costs and health management.
                    </p>
                  </div>
                )}

                {healthCostPerAnimal > profitPerAnimal && profitPerAnimal > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Health Cost Warning:</strong> Health costs per animal exceed profit margins. Consider preventive health measures.
                    </p>
                  </div>
                )}

                {feedEfficiency >= 0.5 && (dashboardStats?.netProfit || 0) > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Great Performance:</strong> Your livestock operation is showing excellent efficiency and profitability metrics!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}