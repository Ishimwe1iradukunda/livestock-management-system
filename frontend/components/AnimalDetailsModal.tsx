import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  PawPrint, 
  Heart, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Weight,
  Activity,
  Target,
  Zap,
  Edit
} from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import type { Animal } from "~backend/animals/create";
import AnimalForm from "./AnimalForm";

interface AnimalDetailsModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AnimalDetailsModal({ animal, isOpen, onClose, onUpdate }: AnimalDetailsModalProps) {
  const backend = useBackend();
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["animal-metrics", animal?.id],
    queryFn: () => animal ? backend.animals.getAnimalMetrics({ id: animal.id }) : null,
    enabled: !!animal,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "deceased":
        return "bg-red-100 text-red-800 border-red-200";
      case "quarantine":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVaccinationStatusColor = (status: string) => {
    switch (status) {
      case "up_to_date":
        return "bg-green-100 text-green-800 border-green-200";
      case "due":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateAge = (birthDate: Date | string | null | undefined) => {
    if (!birthDate) return "Unknown";
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) return `${ageInDays} days`;
    if (ageInDays < 365) return `${Math.floor(ageInDays / 30)} months`;
    return `${Math.floor(ageInDays / 365)} years`;
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    onUpdate();
  };

  if (!animal) return null;

  if (showEditForm) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
          <AnimalForm
            animal={animal}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditForm(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PawPrint className="h-6 w-6" />
              <div>
                <SheetTitle>#{animal.tagNumber}</SheetTitle>
                <SheetDescription>
                  {animal.name || "Unnamed"} • {animal.species}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(animal.status)}>
                {animal.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Species:</span>
                  <div className="font-medium capitalize">{animal.species}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Breed:</span>
                  <div className="font-medium">{animal.breed || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span>
                  <div className="font-medium capitalize">{animal.gender || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Age:</span>
                  <div className="font-medium">{calculateAge(animal.birthDate)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <div className="font-medium">{animal.weight ? `${animal.weight} kg` : "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Color:</span>
                  <div className="font-medium">{animal.color || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Birth Date:</span>
                  <div className="font-medium">{formatDate(animal.birthDate)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <div className="font-medium">{formatDate(animal.purchaseDate)}</div>
                </div>
              </div>
              {animal.notes && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm mt-1">{animal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {metrics && !metricsLoading && (
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="production">Production</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Growth Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Weight Gain</span>
                          <span className="font-medium">{metrics.weightGain.toFixed(1)} kg</span>
                        </div>
                        <Progress value={Math.min(100, (metrics.weightGain / 100) * 100)} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Daily Gain</span>
                          <span className="font-medium">{metrics.averageDailyGain.toFixed(2)} kg/day</span>
                        </div>
                        <Progress value={Math.min(100, (metrics.averageDailyGain / 2) * 100)} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Age: {metrics.ageInDays} days
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Feed Efficiency
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Feed Efficiency</span>
                          <span className="font-medium">{metrics.feedEfficiency.toFixed(3)}</span>
                        </div>
                        <Progress value={Math.min(100, metrics.feedEfficiency * 200)} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Feed Cost: {formatCurrency(metrics.totalFeedCost)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="health" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Health Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vaccination Status:</span>
                        <Badge className={getVaccinationStatusColor(metrics.vaccinationStatus)}>
                          {metrics.vaccinationStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Health Records:</span>
                        <span className="font-medium">{metrics.healthRecordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Health Cost:</span>
                        <span className="font-medium">{formatCurrency(metrics.totalHealthCost)}</span>
                      </div>
                      {metrics.lastHealthRecord && (
                        <div className="text-xs text-muted-foreground">
                          Last Record: {formatDate(metrics.lastHealthRecord)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="production" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Production Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Production:</span>
                        <span className="font-medium">{metrics.totalProduction.toFixed(1)} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Production Value:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(metrics.productionValue)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Financial Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Costs:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(metrics.totalCosts)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Revenue:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(metrics.totalRevenue)}
                        </span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Net Profit:</span>
                          <span className={`font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(metrics.netProfit)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ROI:</span>
                        <span className={`font-medium ${metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.roi.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Performance Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {Math.max(0, Math.min(100, metrics.roi + 50)).toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">Performance Score</div>
                        <Progress value={Math.max(0, Math.min(100, metrics.roi + 50))} />
                        <div className="text-xs text-muted-foreground mt-2">
                          Based on ROI and efficiency metrics
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {metricsLoading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading metrics...</span>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}