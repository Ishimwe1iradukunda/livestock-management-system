import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, DollarSign } from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import HealthRecordForm from "../components/HealthRecordForm";

export default function Health() {
  const backend = useBackend();
  const [showForm, setShowForm] = useState(false);
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["health-records", recordTypeFilter],
    queryFn: () =>
      backend.health.list({
        recordType: recordTypeFilter || undefined,
        limit: 100,
      }),
  });

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "vaccination":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "treatment":
        return "bg-green-100 text-green-800 border-green-200";
      case "checkup":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "illness":
        return "bg-red-100 text-red-800 border-red-200";
      case "injury":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medication":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    refetch();
  };

  if (showForm) {
    return (
      <HealthRecordForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Records</h1>
          <p className="text-muted-foreground">Track animal health and medical records</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="vaccination">Vaccination</SelectItem>
            <SelectItem value="treatment">Treatment</SelectItem>
            <SelectItem value="checkup">Checkup</SelectItem>
            <SelectItem value="illness">Illness</SelectItem>
            <SelectItem value="injury">Injury</SelectItem>
            <SelectItem value="medication">Medication</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.records?.map((record: any) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    #{record.tag_number}
                  </CardTitle>
                  <Badge className={getRecordTypeColor(record.recordType)}>
                    {record.recordType}
                  </Badge>
                </div>
                <CardDescription>
                  {record.animal_name || "Unnamed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">{record.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(record.recordDate)}</span>
                    </div>
                    {record.cost > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(record.cost)}</span>
                      </div>
                    )}
                    {record.veterinarian && (
                      <div className="text-muted-foreground">
                        Vet: {record.veterinarian}
                      </div>
                    )}
                    {record.nextDueDate && (
                      <div className="text-muted-foreground">
                        Next due: {formatDate(record.nextDueDate)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!data?.records || data.records.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No health records found</h3>
            <p className="text-muted-foreground text-center">
              {recordTypeFilter
                ? "Try adjusting your filter"
                : "Get started by adding your first health record"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
