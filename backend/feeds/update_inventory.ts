import { api } from "encore.dev/api";
import db from "../db";

export interface UpdateInventoryRequest {
  feedId: number;
  reorderLevel?: number;
  maxStockLevel?: number;
  notes?: string;
}

export interface FeedInventory {
  id: number;
  feedId: number;
  quantityOnHand: number;
  reorderLevel: number;
  maxStockLevel: number;
  lastUpdated: Date;
  notes?: string;
}

// Updates feed inventory settings.
export const updateInventory = api<UpdateInventoryRequest, FeedInventory>(
  { expose: true, method: "PUT", path: "/feeds/:feedId/inventory" },
  async (params) => {
    const row = await db.queryRow<any>`
      UPDATE feed_inventory 
      SET 
        reorder_level = COALESCE(${params.reorderLevel}, reorder_level),
        max_stock_level = COALESCE(${params.maxStockLevel}, max_stock_level),
        notes = COALESCE(${params.notes}, notes),
        last_updated = NOW()
      WHERE feed_id = ${params.feedId}
      RETURNING *
    `;
    
    if (!row) {
      throw new Error("Feed inventory not found");
    }
    
    return {
      id: row.id,
      feedId: row.feed_id,
      quantityOnHand: row.quantity_on_hand,
      reorderLevel: row.reorder_level,
      maxStockLevel: row.max_stock_level,
      lastUpdated: row.last_updated,
      notes: row.notes,
    } as FeedInventory;
  }
);