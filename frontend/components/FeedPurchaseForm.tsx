import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Package } from "lucide-react";
import { useBackend } from "../hooks/useBackend";

interface FeedPurchaseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FeedPurchaseForm({ onSuccess, onCancel }: FeedPurchaseFormProps) {
  const backend = useBackend();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    feedId: "",
    supplier: "",
    quantity: "",
    unitCost: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
    batchNumber: "",
    invoiceNumber: "",
    notes: "",
  });

  const { data: feedsData } = useQuery({
    queryKey: ["feeds"],
    queryFn: () => backend.feeds.list({ isActive: true }),
  });

  const selectedFeed = feedsData?.feeds.find(f => f.id.toString() === formData.feedId);
  const totalCost = formData.quantity && formData.unitCost 
    ? (parseFloat(formData.quantity) * parseFloat(formData.unitCost)).toFixed(2)
    : "0.00";

  const purchaseMutation = useMutation({
    mutationFn: backend.feeds.purchase,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feed purchase recorded successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Purchase error:", error);
      toast({
        title: "Error",
        description: "Failed to record feed purchase",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      feedId: parseInt(formData.feedId),
      supplier: formData.supplier || undefined,
      quantity: parseFloat(formData.quantity),
      unitCost: parseFloat(formData.unitCost),
      purchaseDate: new Date(formData.purchaseDate),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      batchNumber: formData.batchNumber || undefined,
      invoiceNumber: formData.invoiceNumber || undefined,
      notes: formData.notes || undefined,
    };

    purchaseMutation.mutate(submitData);
  };

  const isLoading = purchaseMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Record Feed Purchase</h1>
          <p className="text-muted-foreground">Add new feed inventory from purchase</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Information
          </CardTitle>
          <CardDescription>Fill in the details below to record the feed purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feedId">Feed Type *</Label>
                <Select
                  value={formData.feedId}
                  onValueChange={(value) => setFormData({ ...formData, feedId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedsData?.feeds.map((feed) => (
                      <SelectItem key={feed.id} value={feed.id.toString()}>
                        {feed.name} ({feed.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder={selectedFeed?.supplier || "Enter supplier name"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity * {selectedFeed && `(${selectedFeed.unit})`}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">
                  Unit Cost ($) {selectedFeed && `per ${selectedFeed.unit}`}
                </Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  placeholder={selectedFeed?.costPerUnit?.toString() || "e.g., 2.50"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="e.g., B2024001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="e.g., INV-2024-001"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this purchase..."
                rows={3}
              />
            </div>
            
            {formData.quantity && formData.unitCost && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <span className="text-2xl font-bold text-primary">${totalCost}</span>
                </div>
                {selectedFeed && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {formData.quantity} {selectedFeed.unit} × ${formData.unitCost} per {selectedFeed.unit}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Recording..." : "Record Purchase"}
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