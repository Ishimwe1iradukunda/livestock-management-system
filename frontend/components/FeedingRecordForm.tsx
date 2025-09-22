import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Utensils } from "lucide-react";
import backend from "~backend/client";

interface FeedingRecordFormProps {
  animalId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FeedingRecordForm({ animalId, onSuccess, onCancel }: FeedingRecordFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    animalId: animalId?.toString() || "",
    feedId: "",
    feedType: "",
    quantity: "",
    unit: "kg",
    feedingDate: new Date().toISOString().split('T')[0],
    cost: "",
    notes: "",
  });

  const { data: animalsData } = useQuery({
    queryKey: ["animals"],
    queryFn: () => backend.animals.list({ status: "active" }),
  });

  const { data: feedsData } = useQuery({
    queryKey: ["feeds"],
    queryFn: () => backend.feeds.list({ isActive: true }),
  });

  const selectedFeed = feedsData?.feeds.find(f => f.id.toString() === formData.feedId);
  const selectedAnimal = animalsData?.animals.find(a => a.id.toString() === formData.animalId);
  
  const estimatedCost = formData.quantity && selectedFeed?.costPerUnit 
    ? (parseFloat(formData.quantity) * selectedFeed.costPerUnit).toFixed(2)
    : "0.00";

  const createMutation = useMutation({
    mutationFn: backend.feeding.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feeding record created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create feeding record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      animalId: parseInt(formData.animalId),
      feedId: formData.feedId ? parseInt(formData.feedId) : undefined,
      feedType: formData.feedType || undefined,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      feedingDate: new Date(formData.feedingDate),
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      notes: formData.notes || undefined,
    };

    createMutation.mutate(submitData);
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Record Feeding</h1>
          <p className="text-muted-foreground">Log feed consumption for an animal</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Feeding Information
          </CardTitle>
          <CardDescription>Record what and how much was fed to the animal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal *</Label>
                <Select
                  value={formData.animalId}
                  onValueChange={(value) => setFormData({ ...formData, animalId: value })}
                  disabled={!!animalId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animalsData?.animals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id.toString()}>
                        #{animal.tagNumber} - {animal.name || "Unnamed"} ({animal.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedingDate">Feeding Date *</Label>
                <Input
                  id="feedingDate"
                  type="date"
                  value={formData.feedingDate}
                  onChange={(e) => setFormData({ ...formData, feedingDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedId">Feed Type</Label>
                <Select
                  value={formData.feedId}
                  onValueChange={(value) => {
                    const feed = feedsData?.feeds.find(f => f.id.toString() === value);
                    setFormData({ 
                      ...formData, 
                      feedId: value,
                      feedType: feed?.type || "",
                      unit: feed?.unit || "kg"
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Feed Type</SelectItem>
                    {feedsData?.feeds.map((feed) => (
                      <SelectItem key={feed.id} value={feed.id.toString()}>
                        {feed.name} ({feed.type}) - {feed.quantityOnHand} {feed.unit} available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!formData.feedId && (
                <div className="space-y-2">
                  <Label htmlFor="feedType">Custom Feed Type</Label>
                  <Input
                    id="feedType"
                    value={formData.feedType}
                    onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                    placeholder="e.g., Mixed hay"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 5.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  disabled={!!selectedFeed}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="bales">bales</SelectItem>
                    <SelectItem value="bags">bags</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder={`Estimated: $${estimatedCost}`}
                />
                {selectedFeed && (
                  <p className="text-xs text-muted-foreground">
                    Estimated: ${estimatedCost} (${formData.quantity || 0} × ${selectedFeed.costPerUnit})
                  </p>
                )}
              </div>
            </div>
            
            {selectedFeed && formData.quantity && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Nutritional Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Protein:</span>
                      <div className="font-medium">
                        {((selectedFeed.proteinPercentage / 100) * parseFloat(formData.quantity || "0")).toFixed(1)} kg
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Energy:</span>
                      <div className="font-medium">
                        {(selectedFeed.energyValue * parseFloat(formData.quantity || "0")).toFixed(1)} MJ
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fiber:</span>
                      <div className="font-medium">
                        {((selectedFeed.fiberPercentage / 100) * parseFloat(formData.quantity || "0")).toFixed(1)} kg
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fat:</span>
                      <div className="font-medium">
                        {((selectedFeed.fatPercentage / 100) * parseFloat(formData.quantity || "0")).toFixed(1)} kg
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this feeding..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Recording..." : "Record Feeding"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}