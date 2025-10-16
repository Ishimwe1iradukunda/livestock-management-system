import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { useBackend } from "../hooks/useBackend";

interface FeedFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FeedForm({ onSuccess, onCancel }: FeedFormProps) {
  const backend = useBackend();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    supplier: "",
    unit: "kg",
    costPerUnit: "",
    proteinPercentage: "",
    energyValue: "",
    fiberPercentage: "",
    fatPercentage: "",
    description: "",
    storageLocation: "",
  });

  const createMutation = useMutation({
    mutationFn: backend.feeds.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feed created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create feed",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      type: formData.type as any,
      supplier: formData.supplier || undefined,
      unit: formData.unit || "kg",
      costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : undefined,
      proteinPercentage: formData.proteinPercentage ? parseFloat(formData.proteinPercentage) : undefined,
      energyValue: formData.energyValue ? parseFloat(formData.energyValue) : undefined,
      fiberPercentage: formData.fiberPercentage ? parseFloat(formData.fiberPercentage) : undefined,
      fatPercentage: formData.fatPercentage ? parseFloat(formData.fatPercentage) : undefined,
      description: formData.description || undefined,
      storageLocation: formData.storageLocation || undefined,
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
          <h1 className="text-3xl font-bold text-foreground">Add New Feed</h1>
          <p className="text-muted-foreground">Enter details for the new feed type</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feed Information</CardTitle>
          <CardDescription>Fill in the details below to register the feed</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Feed Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Alfalfa Hay"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Feed Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
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
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="e.g., Local Feed Store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="tons">tons</SelectItem>
                    <SelectItem value="bales">bales</SelectItem>
                    <SelectItem value="bags">bags</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Cost per Unit ($)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  placeholder="e.g., 2.50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageLocation">Storage Location</Label>
                <Input
                  id="storageLocation"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  placeholder="e.g., Barn A, Section 1"
                />
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="proteinPercentage">Protein (%)</Label>
                <Input
                  id="proteinPercentage"
                  type="number"
                  step="0.1"
                  value={formData.proteinPercentage}
                  onChange={(e) => setFormData({ ...formData, proteinPercentage: e.target.value })}
                  placeholder="e.g., 18.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="energyValue">Energy (MJ/kg)</Label>
                <Input
                  id="energyValue"
                  type="number"
                  step="0.1"
                  value={formData.energyValue}
                  onChange={(e) => setFormData({ ...formData, energyValue: e.target.value })}
                  placeholder="e.g., 12.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiberPercentage">Fiber (%)</Label>
                <Input
                  id="fiberPercentage"
                  type="number"
                  step="0.1"
                  value={formData.fiberPercentage}
                  onChange={(e) => setFormData({ ...formData, fiberPercentage: e.target.value })}
                  placeholder="e.g., 25.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatPercentage">Fat (%)</Label>
                <Input
                  id="fatPercentage"
                  type="number"
                  step="0.1"
                  value={formData.fatPercentage}
                  onChange={(e) => setFormData({ ...formData, fatPercentage: e.target.value })}
                  placeholder="e.g., 3.2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes about this feed..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Add Feed"}
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