import { api } from "encore.dev/api";
import db from "../db";

export interface CreateFeedRequest {
  name: string;
  type: "hay" | "grain" | "pellets" | "supplement" | "mineral" | "concentrate" | "silage" | "pasture";
  supplier?: string;
  unit?: string;
  costPerUnit?: number;
  proteinPercentage?: number;
  energyValue?: number;
  fiberPercentage?: number;
  fatPercentage?: number;
  description?: string;
  storageLocation?: string;
}

export interface Feed {
  id: number;
  name: string;
  type: string;
  supplier?: string;
  unit: string;
  costPerUnit: number;
  proteinPercentage: number;
  energyValue: number;
  fiberPercentage: number;
  fatPercentage: number;
  description?: string;
  storageLocation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new feed type.
export const create = api<CreateFeedRequest, Feed>(
  { expose: true, method: "POST", path: "/feeds" },
  async (params) => {
    const row = await db.queryRow<any>`
      INSERT INTO feeds (
        name, type, supplier, unit, cost_per_unit, protein_percentage,
        energy_value, fiber_percentage, fat_percentage, description, storage_location
      ) VALUES (
        ${params.name}, ${params.type}, ${params.supplier}, ${params.unit || 'kg'},
        ${params.costPerUnit || 0}, ${params.proteinPercentage || 0},
        ${params.energyValue || 0}, ${params.fiberPercentage || 0},
        ${params.fatPercentage || 0}, ${params.description}, ${params.storageLocation}
      ) RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create feed");
    }
    
    // Initialize inventory record
    await db.exec`
      INSERT INTO feed_inventory (feed_id, quantity_on_hand) 
      VALUES (${row.id}, 0)
    `;
    
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      supplier: row.supplier,
      unit: row.unit,
      costPerUnit: row.cost_per_unit,
      proteinPercentage: row.protein_percentage,
      energyValue: row.energy_value,
      fiberPercentage: row.fiber_percentage,
      fatPercentage: row.fat_percentage,
      description: row.description,
      storageLocation: row.storage_location,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as Feed;
  }
);