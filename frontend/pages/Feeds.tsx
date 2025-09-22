import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, ShoppingCart, Utensils, AlertTriangle } from "lucide-react";
import backend from "~backend/client";
import FeedForm from "../components/FeedForm";
import FeedPurchaseForm from "../components/FeedPurchaseForm";
import FeedingRecordForm from "../components/FeedingRecordForm";

export default function Feeds() {
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showFeedingForm, setShowFeedingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data: feedsData, isLoading, refetch } = useQuery({
    queryKey: ["feeds", typeFilter],
    queryFn: () => backend.feeds.list({ type: typeFilter || undefined }),
  });

  const filteredFeeds = feedsData?.feeds?.filter((feed) =>
    feed.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const lowStockFeeds = filteredFeeds.filter(feed => feed.needsReorder);

  const handleFormSuccess = () => {
    setShowFeedForm(false);
    setShowPurchaseForm(false);
    setShowFeedingForm(false);
    refetch();
  };

  const getFeedTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hay: "bg-green-100 text-green-800 border-green-200",
      grain: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pellets: "bg-blue-100 text-blue-800 border-blue-200",
      supplement: "bg-purple-100 text-purple-800 border-purple-200",
      mineral: "bg-orange-100 text-orange-800 border-orange-200",
      concentrate: "bg-red-100 text-red-800 border-red-200",
      silage: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pasture: "bg-lime-100 text-lime-800 border-lime-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (showFeedForm) {
    return (
      <FeedForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowFeedForm(false)}
      />
    );
  }

  if (showPurchaseForm) {
    return (
      <FeedPurchaseForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowPurchaseForm(false)}
      />
    );
  }

  if (showFeedingForm) {
    return (
      <FeedingRecordForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowFeedingForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed Management</h1>
          <p className="text-muted-foreground">Manage feed inventory and feeding records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFeedingForm(true)} variant="outline" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Record Feeding
          </Button>
          <Button onClick={() => setShowPurchaseForm(true)} variant="outline" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase Feed
          </Button>
          <Button onClick={() => setShowFeedForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Feed Type
          </Button>
        </div>
      </div>

      {lowStockFeeds.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-3">
              {lowStockFeeds.length} feed type(s) need restocking:
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockFeeds.map((feed) => (
                <Badge key={feed.id} variant="outline" className="text-amber-700 border-amber-300">
                  {feed.name}: {feed.quantityOnHand} {feed.unit} remaining
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Feed Inventory</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="feeding">Feeding Records</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="hay">Hay</SelectItem>
                <SelectItem value="grain">Grain</SelectItem>
                <SelectItem value="pellets">Pellets</SelectItem>
                <SelectItem value="supplement">Supplement</SelectItem>
                <SelectItem value="mineral">Mineral</SelectItem>
                <SelectItem value="concentrate">Concentrate</SelectItem>
                <SelectItem value="silage">Silage</SelectItem>
                <SelectItem value="pasture">Pasture</SelectItem>
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
              {filteredFeeds.map((feed) => (
                <Card key={feed.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{feed.name}</CardTitle>
                      <Badge className={getFeedTypeColor(feed.type)}>
                        {feed.type}
                      </Badge>
                    </div>
                    <CardDescription>
                      {feed.supplier && `Supplier: ${feed.supplier}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <span className={`font-medium ${feed.needsReorder ? 'text-red-600' : 'text-green-600'}`}>
                          {feed.quantityOnHand} {feed.unit}
                        </span>
                      </div>
                      
                      {feed.reorderLevel > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Reorder at:</span>
                          <span className="text-sm">{feed.reorderLevel} {feed.unit}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cost per {feed.unit}:</span>
                        <span className="font-medium">${feed.costPerUnit.toFixed(2)}</span>
                      </div>
                      
                      {feed.proteinPercentage > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Protein: {feed.proteinPercentage}%</div>
                          <div>Fiber: {feed.fiberPercentage}%</div>
                        </div>
                      )}
                      
                      {feed.storageLocation && (
                        <div className="text-xs text-muted-foreground">
                          📍 {feed.storageLocation}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredFeeds.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No feeds found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || typeFilter
                    ? "Try adjusting your search criteria"
                    : "Get started by adding your first feed type"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>Recent feed purchases and inventory updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Purchase history coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feeding">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Records</CardTitle>
              <CardDescription>Recent feeding activities and consumption tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Feeding records coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}