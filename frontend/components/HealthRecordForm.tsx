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
import backend from "~backend/client";

interface HealthRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function HealthRecordForm({ onSuccess, onCancel }: HealthRecordFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    animalId: "",
    recordDate: new Date().toISOString().split('T')[0],
    recordType: "",
    description: "",
    veterinarian: "",
    cost: "",
    nextDueDate: "",
    notes: "",
  });

  const { data: animalsData } = useQuery({
    queryKey: ["animals-list"],
    queryFn: () => backend.animals.list({ limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: backend.health.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health record created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create health record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.animalId || !formData.recordType || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      animalId: parseInt(formData.animalId),
      recordDate: new Date(formData.recordDate),
      recordType: formData.recordType as any,
      description: formData.description,
      veterinarian: formData.veterinarian || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : undefined,
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
          <h1 className="text-3xl font-bold text-foreground">Add Health Record</h1>
          <p className="text-muted-foreground">Record medical information for an animal</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Record Information</CardTitle>
          <CardDescription>Fill in the details for the health record</CardDescription>
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
                <Label htmlFor="recordDate">Record Date *</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={formData.recordDate}
                  onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type *</Label>
                <Select
                  value={formData.recordType}
                  onValueChange={(value) => setFormData({ ...formData, recordType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="treatment">Treatment</SelectItem>
                    <SelectItem value="checkup">Checkup</SelectItem>
                    <SelectItem value="illness">Illness</SelectItem>
                    <SelectItem value="injury">Injury</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="veterinarian">Veterinarian</Label>
                <Input
                  id="veterinarian"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                  placeholder="Dr. Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Next Due Date</Label>
                <Input
                  id="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the health record..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
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
