import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Feed } from "./create";

export interface ListFeedsRequest {
  type?: Query<string>;
  isActive?: Query<boolean>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface FeedWithInventory extends Feed {
  quantityOnHand: number;
  reorderLevel: number;
  maxStockLevel: number;
  needsReorder: boolean;
}

export interface ListFeedsResponse {
  feeds: FeedWithInventory[];
  total: number;
}

// Retrieves all feeds with inventory information.
export const list = api<ListFeedsRequest, ListFeedsResponse>(
  { expose: true, method: "GET", path: "/feeds" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE f.is_active = true";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.type) {
      whereClause += ` AND f.type = $${paramIndex}`;
      queryParams.push(params.type);
      paramIndex++;
    }
    
    if (params.isActive !== undefined) {
      whereClause = `WHERE f.is_active = $${paramIndex}`;
      queryParams.push(params.isActive);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) as count FROM feeds f ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...queryParams);
    const total = countResult?.count || 0;
    
    const dataQuery = `
      SELECT 
        f.*,
        COALESCE(fi.quantity_on_hand, 0) as quantity_on_hand,
        COALESCE(fi.reorder_level, 0) as reorder_level,
        COALESCE(fi.max_stock_level, 0) as max_stock_level
      FROM feeds f
      LEFT JOIN feed_inventory fi ON f.id = fi.feed_id
      ${whereClause}
      ORDER BY f.name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    const feeds: FeedWithInventory[] = rows.map(row => ({
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
      quantityOnHand: row.quantity_on_hand,
      reorderLevel: row.reorder_level,
      maxStockLevel: row.max_stock_level,
      needsReorder: row.quantity_on_hand <= row.reorder_level && row.reorder_level > 0,
    }));
    
    return { feeds, total };
  }
);