import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  PawPrint, 
  Heart, 
  TrendingUp, 
  DollarSign, 
  Package,
  Zap,
  Database,
  Upload
} from "lucide-react";
import AnimalForm from "./AnimalForm";
import HealthRecordForm from "./HealthRecordForm";
import ProductionRecordForm from "./ProductionRecordForm";
import FeedingRecordForm from "./FeedingRecordForm";
import FinancialRecordForm from "./FinancialRecordForm";
import FeedForm from "./FeedForm";
import FeedPurchaseForm from "./FeedPurchaseForm";

interface AdvancedDataEntryProps {
  onClose: () => void;
}

const dataEntryTypes = [
  {
    id: "animals",
    title: "Animal Management",
    description: "Add new animals, update existing records",
    icon: PawPrint,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    id: "health",
    title: "Health Records",
    description: "Vaccinations, treatments, checkups",
    icon: Heart,
    color: "bg-red-100 text-red-800 border-red-200"
  },
  {
    id: "production",
    title: "Production Data",
    description: "Milk, eggs, meat production records",
    icon: TrendingUp,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  {
    id: "feeding",
    title: "Feeding Records",
    description: "Daily feeding logs and nutrition data",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  {
    id: "financial",
    title: "Financial Records",
    description: "Income, expenses, sales tracking",
    icon: DollarSign,
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    id: "feeds",
    title: "Feed Management",
    description: "Feed types, inventory, purchases",
    icon: Package,
    color: "bg-orange-100 text-orange-800 border-orange-200"
  }
];

export default function AdvancedDataEntry({ onClose }: AdvancedDataEntryProps) {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [feedSubForm, setFeedSubForm] = useState<"feed" | "purchase" | null>(null);

  const handleFormSuccess = () => {
    setActiveForm(null);
    setFeedSubForm(null);
  };

  const handleFormCancel = () => {
    setActiveForm(null);
    setFeedSubForm(null);
  };

  if (activeForm === "animals") {
    return (
      <AnimalForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (activeForm === "health") {
    return (
      <HealthRecordForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (activeForm === "production") {
    return (
      <ProductionRecordForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (activeForm === "feeding") {
    return (
      <FeedingRecordForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (activeForm === "financial") {
    return (
      <FinancialRecordForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (activeForm === "feeds") {
    if (feedSubForm === "feed") {
      return (
        <FeedForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      );
    }
    if (feedSubForm === "purchase") {
      return (
        <FeedPurchaseForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Feed Management</h2>
            <p className="text-muted-foreground">Choose what you'd like to add</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFeedSubForm("feed")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                New Feed Type
              </CardTitle>
              <CardDescription>
                Add a new type of feed to your inventory
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFeedSubForm("purchase")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Feed Purchase
              </CardTitle>
              <CardDescription>
                Record a new feed purchase and update inventory
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Entry Center</h2>
          <p className="text-muted-foreground">Choose what you'd like to add to your system</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dataEntryTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveForm(type.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                  <Badge className={type.color}>
                    Quick Add
                  </Badge>
                </div>
                <CardTitle>{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Bulk Data Import
          </CardTitle>
          <CardDescription>
            Import large amounts of data from spreadsheets or external systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Coming Soon - Bulk Import
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}