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

interface FinancialRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FinancialRecordForm({ onSuccess, onCancel }: FinancialRecordFormProps) {
  const backend = useBackend();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    transactionType: "",
    category: "",
    amount: "",
    transactionDate: new Date().toISOString().split('T')[0],
    description: "",
    animalId: "",
    paymentMethod: "",
    receiptNumber: "",
    notes: "",
  });

  const { data: animalsData } = useQuery({
    queryKey: ["animals-list"],
    queryFn: () => backend.animals.list({ limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: backend.financial.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Financial record created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create financial record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.transactionType || !formData.category || !formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      transactionType: formData.transactionType as "income" | "expense",
      category: formData.category,
      amount: parseFloat(formData.amount),
      transactionDate: new Date(formData.transactionDate),
      description: formData.description,
      animalId: formData.animalId ? parseInt(formData.animalId) : undefined,
      paymentMethod: formData.paymentMethod || undefined,
      receiptNumber: formData.receiptNumber || undefined,
      notes: formData.notes || undefined,
    };

    createMutation.mutate(submitData);
  };

  const incomeCategories = [
    "Animal Sales",
    "Milk Sales",
    "Egg Sales",
    "Meat Sales",
    "Breeding Services",
    "Other Income"
  ];

  const expenseCategories = [
    "Feed Purchase",
    "Veterinary Services",
    "Medications",
    "Equipment",
    "Facility Maintenance",
    "Utilities",
    "Insurance",
    "Transportation",
    "Other Expenses"
  ];

  const categories = formData.transactionType === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Financial Record</h1>
          <p className="text-muted-foreground">Record income or expense transaction</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Record Information</CardTitle>
          <CardDescription>Fill in the details for the financial transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transactionType">Transaction Type *</Label>
                <Select
                  value={formData.transactionType}
                  onValueChange={(value) => setFormData({ ...formData, transactionType: value, category: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={!formData.transactionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionDate">Transaction Date *</Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="animalId">Related Animal</Label>
                <Select
                  value={formData.animalId}
                  onValueChange={(value) => setFormData({ ...formData, animalId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific animal</SelectItem>
                    {animalsData?.animals?.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id.toString()}>
                        #{animal.tagNumber} - {animal.name || "Unnamed"} ({animal.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="debit-card">Debit Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                  placeholder="Receipt or invoice number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the transaction..."
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
