import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { useBackend } from "../hooks/useBackend";

interface ProductionRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductionRecordForm({ onSuccess, onCancel }: ProductionRecordFormProps) {
  const backend = useBackend();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    animalId: "",
    productType: "",
    quantity: "",
    unit: "",
    productionDate: new Date().toISOString().split('T')[0],
    qualityGrade: "",
    pricePerUnit: "",
    notes: "",
  });

  const { data: animalsData } = useQuery({
    queryKey: ["animals-list"],
    queryFn: () => backend.animals.list({ limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: backend.production.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Production record created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create production record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.animalId || !formData.productType || !formData.quantity || !formData.unit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      animalId: parseInt(formData.animalId),
      productType: formData.productType,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      productionDate: new Date(formData.productionDate),
      qualityGrade: formData.qualityGrade || undefined,
      pricePerUnit: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : undefined,
      notes: formData.notes || undefined,
    };

    createMutation.mutate(submitData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Production Record</h1>
          <p className="text-muted-foreground">Record production output for an animal</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Record Information</CardTitle>
          <CardDescription>Fill in the details for the production record</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal *</Label>
                <Select
                  value={formData.animalId}
                  onValueChange={(value) => setFormData({ ...formData, animalId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animalsData?.animals?.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id.toString()}>
                        #{animal.tagNumber} - {animal.name || "Unnamed"} ({animal.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productionDate">Production Date *</Label>
                <Input
                  id="productionDate"
                  type="date"
                  value={formData.productionDate}
                  onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productType">Product Type *</Label>
                <Select
                  value={formData.productType}
                  onValueChange={(value) => setFormData({ ...formData, productType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milk">Milk</SelectItem>
                    <SelectItem value="eggs">Eggs</SelectItem>
                    <SelectItem value="wool">Wool</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="honey">Honey</SelectItem>
                    <SelectItem value="cheese">Cheese</SelectItem>
                    <SelectItem value="butter">Butter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 25.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="gallons">Gallons</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="lbs">Pounds</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="dozens">Dozens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualityGrade">Quality Grade</Label>
                <Select
                  value={formData.qualityGrade}
                  onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="grade-a">Grade A</SelectItem>
                    <SelectItem value="grade-b">Grade B</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Price per Unit ($)</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this production..."
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {createMutation.isPending ? "Saving..." : "Add Record"}
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
