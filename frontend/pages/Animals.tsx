import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import AnimalForm from "../components/AnimalForm";
import type { Animal } from "~backend/animals/create";

export default function Animals() {
  const backend = useBackend();
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["animals", speciesFilter, statusFilter],
    queryFn: () =>
      backend.animals.list({
        species: speciesFilter && speciesFilter !== "all" ? speciesFilter : undefined,
        status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        limit: 100,
      }),
  });

  const filteredAnimals = data?.animals?.filter((animal) =>
    animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (animal.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "deceased":
        return "bg-red-100 text-red-800 border-red-200";
      case "quarantine":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAnimal(null);
    refetch();
  };

  if (showForm || editingAnimal) {
    return (
      <AnimalForm
        animal={editingAnimal}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingAnimal(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Animals</h1>
          <p className="text-muted-foreground">Manage your livestock inventory</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Animal
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tag number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="deceased">Deceased</SelectItem>
            <SelectItem value="quarantine">Quarantine</SelectItem>
          </SelectContent>
        </Select>
        <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            <SelectItem value="cattle">Cattle</SelectItem>
            <SelectItem value="sheep">Sheep</SelectItem>
            <SelectItem value="goat">Goat</SelectItem>
            <SelectItem value="pig">Pig</SelectItem>
            <SelectItem value="chicken">Chicken</SelectItem>
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
          {filteredAnimals.map((animal) => (
            <Card
              key={animal.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setEditingAnimal(animal)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{animal.tagNumber}</CardTitle>
                  <Badge className={getStatusColor(animal.status)}>
                    {animal.status}
                  </Badge>
                </div>
                <CardDescription>
                  {animal.name || "Unnamed"} • {animal.species}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {animal.breed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Breed:</span>
                      <span>{animal.breed}</span>
                    </div>
                  )}
                  {animal.gender && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="capitalize">{animal.gender}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Birth Date:</span>
                    <span>{formatDate(animal.birthDate)}</span>
                  </div>
                  {animal.weight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{animal.weight} kg</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredAnimals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No animals found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter || speciesFilter
                ? "Try adjusting your search criteria"
                : "Get started by adding your first animal"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
