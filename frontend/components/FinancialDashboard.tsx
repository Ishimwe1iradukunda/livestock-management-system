import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Target,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Receipt
} from "lucide-react";
import backend from "~backend/client";

interface FinancialDashboardProps {
  timeRange?: string;
}

export default function FinancialDashboard({ timeRange: initialTimeRange }: FinancialDashboardProps) {
  const [timeRange, setTimeRange] = useState(initialTimeRange || "30");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-records", categoryFilter, timeRange],
    queryFn: () => backend.financial.list({
      category: categoryFilter || undefined,
      limit: 200
    }),
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => backend.reports.getDashboardStats(),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Calculate financial metrics
  const records = financialData?.records || [];
  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.transactionDate);
    return recordDate >= startDate && recordDate <= endDate;
  });

  const income = filteredRecords
    .filter(r => r.transactionType === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const expenses = filteredRecords
    .filter(r => r.transactionType === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const netProfit = income - expenses;
  const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = filteredRecords.reduce((acc, record) => {
    const category = record.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { income: 0, expense: 0 };
    }
    if (record.transactionType === 'income') {
      acc[category].income += record.amount;
    } else {
      acc[category].expense += record.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const getCategoryColor = (category: string) => {
    const colors = {
      'feed': 'bg-orange-100 text-orange-800 border-orange-200',
      'health': 'bg-red-100 text-red-800 border-red-200',
      'equipment': 'bg-blue-100 text-blue-800 border-blue-200',
      'sales': 'bg-green-100 text-green-800 border-green-200',
      'maintenance': 'bg-purple-100 text-purple-800 border-purple-200',
      'utilities': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'labor': 'bg-pink-100 text-pink-800 border-pink-200',
      'breeding': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  if (isLoading) {
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
          <h2 className="text-2xl font-bold text-foreground">Financial Dashboard</h2>
          <p className="text-muted-foreground">Track income, expenses and profitability</p>
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              <SelectItem value="feed">Feed</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
              <SelectItem value="breeding">Breeding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(income)}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(expenses)}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin >= 20 ? 'Excellent' : profitMargin >= 10 ? 'Good' : profitMargin >= 0 ? 'Break-even' : 'Loss'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Breakdown
            </CardTitle>
            <CardDescription>Income and expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => (b.income + b.expense) - (a.income + a.expense))
                .slice(0, 6)
                .map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(category)} variant="outline">
                        {category}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(data.income + data.expense)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-green-600">+{formatCurrency(data.income)}</span>
                      <span className="text-red-600">-{formatCurrency(data.expense)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Financial Ratios
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Income/Expense Ratio:</span>
                <span className="font-medium">
                  {expenses > 0 ? (income / expenses).toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Daily Avg Income:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(income / parseInt(timeRange))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Daily Avg Expenses:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(expenses / parseInt(timeRange))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Break-even Point:</span>
                <span className="font-medium">
                  {netProfit >= 0 ? 'Achieved' : formatCurrency(Math.abs(netProfit))} needed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">ROI Projection:</span>
                <span className={`font-medium ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(profitMargin * 12 / parseInt(timeRange) * 30).toFixed(1)}% annually
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Last {Math.min(10, filteredRecords.length)} transactions in selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRecords
              .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
              .slice(0, 10)
              .map((record) => {
                const Icon = getTransactionIcon(record.transactionType);
                const isIncome = record.transactionType === 'income';
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                      <div>
                        <p className="font-medium">{record.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDate(record.transactionDate)}</span>
                          {record.category && (
                            <Badge variant="outline" className={getCategoryColor(record.category)}>
                              {record.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(record.amount)}
                    </div>
                  </div>
                );
              })}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}