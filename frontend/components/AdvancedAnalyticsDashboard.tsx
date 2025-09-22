import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Activity,
  DollarSign,
  BarChart3,
  PieChart,
  Award,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users
} from "lucide-react";
import backend from "~backend/client";

export default function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("365"); // days
  const [species, setSpecies] = useState<string>("");

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["advanced-analytics", timeRange, species],
    queryFn: () => backend.reports.getAdvancedAnalytics({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      species: species || undefined,
    }),
  });

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Advanced Analytics</h2>
            <p className="text-muted-foreground">Comprehensive performance insights and predictions</p>
          </div>
        </div>
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

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive performance insights and predictions</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="730">Last 2 years</SelectItem>
            </SelectContent>
          </Select>
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All species</SelectItem>
              <SelectItem value="cattle">Cattle</SelectItem>
              <SelectItem value="sheep">Sheep</SelectItem>
              <SelectItem value="goat">Goat</SelectItem>
              <SelectItem value="pig">Pig</SelectItem>
              <SelectItem value="chicken">Chicken</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily Gain</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageDailyGain.toFixed(2)} kg</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.averageDailyGain > 0.5 ? 'Excellent' : analytics.averageDailyGain > 0.3 ? 'Good' : 'Needs improvement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feed Conversion</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.feedConversionRatio.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.feedConversionRatio < 3 ? 'Excellent' : analytics.feedConversionRatio < 5 ? 'Good' : 'Needs improvement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(analytics.mortalityRate, 5, true)}`}>
                  {analytics.mortalityRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.mortalityRate < 2 ? 'Excellent' : analytics.mortalityRate < 5 ? 'Good' : 'High'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reproduction Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.reproductionRate.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Offspring per animal</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Feed Efficiency</span>
                    <span className="font-medium">{analytics.feedConversionRatio.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(100, (5 - analytics.feedConversionRatio) * 20)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Production Efficiency</span>
                    <span className="font-medium">{analytics.productionEfficiency.toFixed(3)}</span>
                  </div>
                  <Progress value={Math.min(100, analytics.productionEfficiency * 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Health Compliance</span>
                    <span className="font-medium">{analytics.vaccinationCompliance.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.vaccinationCompliance} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.animalId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">#{performer.tagNumber}</div>
                          <div className="text-xs text-muted-foreground">{performer.name || "Unnamed"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium text-sm ${getScoreColor(performer.performanceScore)}`}>
                          {performer.performanceScore.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {performer.roi.toFixed(1)}% ROI
                        </div>
                      </div>
                    </div>
                  ))}
                  {analytics.topPerformers.length === 0 && (
                    <p className="text-muted-foreground text-center text-sm">No performance data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit per Animal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(analytics.profitPerAnimal, 0)}`}>
                  {formatCurrency(analytics.profitPerAnimal)}
                </div>
                <p className="text-xs text-muted-foreground">Average profitability</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost per Kg Gain</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.costPerKgGain)}</div>
                <p className="text-xs text-muted-foreground">Feed efficiency cost</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue per Animal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.revenuePerAnimal)}
                </div>
                <p className="text-xs text-muted-foreground">Average revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Break-even Point</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.breakEvenPoint > 0 ? analytics.breakEvenPoint.toFixed(0) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Animals needed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Cost per Animal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.healthCostPerAnimal)}</div>
                <p className="text-xs text-muted-foreground">Average health spending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vaccination Compliance</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(analytics.vaccinationCompliance)}`}>
                  {analytics.vaccinationCompliance.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Animals up to date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Health Records</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageHealthRecordsPerAnimal.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Records per animal</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Seasonal Trends
              </CardTitle>
              <CardDescription>Monthly performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.seasonalTrends.map((trend, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                    <div>
                      <div className="text-sm font-medium">{trend.month}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Production</div>
                      <div className="font-medium">{trend.production.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="font-medium text-green-600">{formatCurrency(trend.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Costs</div>
                      <div className="font-medium text-red-600">{formatCurrency(trend.costs)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(analytics.projectedGrowth, 0)}`}>
                  {analytics.projectedGrowth.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Units (next 12 months)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.projectedRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">Next 12 months</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected Costs</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(analytics.projectedCosts)}
                </div>
                <p className="text-xs text-muted-foreground">Next 12 months</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.feedConversionRatio > 4 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>Feed Efficiency:</strong> Consider reviewing feed quality and feeding schedules. Current conversion ratio is above optimal levels.
                    </p>
                  </div>
                )}
                
                {analytics.mortalityRate > 5 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Health Alert:</strong> Mortality rate is high. Review health management practices and consider veterinary consultation.
                    </p>
                  </div>
                )}

                {analytics.vaccinationCompliance < 80 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Vaccination Compliance:</strong> Improve vaccination schedules to maintain herd health and prevent disease outbreaks.
                    </p>
                  </div>
                )}

                {analytics.profitPerAnimal < 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Profitability Alert:</strong> Current operations are running at a loss. Review cost structure and pricing strategies.
                    </p>
                  </div>
                )}

                {analytics.feedConversionRatio <= 3 && analytics.mortalityRate <= 2 && analytics.profitPerAnimal > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Excellent Performance:</strong> Your livestock operation is showing outstanding efficiency and profitability metrics!
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