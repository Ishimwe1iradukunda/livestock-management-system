import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Feed } from "./create";

export interface GetFeedRequest {
  id: number;
}

// Retrieves a specific feed by ID.
export const get = api<GetFeedRequest, Feed>(
  { expose: true, method: "GET", path: "/feeds/:id" },
  async (params) => {
    const row = await db.queryRow<any>`
      SELECT * FROM feeds WHERE id = ${params.id}
    `;
    
    if (!row) {
      throw APIError.notFound("feed not found");
    }
    
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