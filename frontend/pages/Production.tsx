import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, TrendingUp } from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import ProductionRecordForm from "../components/ProductionRecordForm";

export default function Production() {
  const backend = useBackend();
  const [showForm, setShowForm] = useState(false);
  const [productTypeFilter, setProductTypeFilter] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["production-records", productTypeFilter],
    queryFn: () =>
      backend.production.list({
        productType: productTypeFilter || undefined,
        limit: 100,
      }),
  });

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
      <ProductionRecordForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Records</h1>
          <p className="text-muted-foreground">Track animal production and output</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            <SelectItem value="milk">Milk</SelectItem>
            <SelectItem value="eggs">Eggs</SelectItem>
            <SelectItem value="wool">Wool</SelectItem>
            <SelectItem value="meat">Meat</SelectItem>
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
                  <Badge variant="outline" className="capitalize">
                    {record.productType}
                  </Badge>
                </div>
                <CardDescription>
                  {record.animal_name || "Unnamed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {record.quantity} {record.unit}
                    </span>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(record.productionDate)}</span>
                    </div>
                    {record.qualityGrade && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quality:</span>
                        <span className="capitalize">{record.qualityGrade}</span>
                      </div>
                    )}
                    {record.pricePerUnit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price/Unit:</span>
                        <span>{formatCurrency(record.pricePerUnit)}</span>
                      </div>
                    )}
                    {record.totalValue > 0 && (
                      <div className="flex justify-between font-semibold">
                        <span>Total Value:</span>
                        <span className="text-green-600">{formatCurrency(record.totalValue)}</span>
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
            <h3 className="text-lg font-semibold mb-2">No production records found</h3>
            <p className="text-muted-foreground text-center">
              {productTypeFilter
                ? "Try adjusting your filter"
                : "Get started by adding your first production record"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
