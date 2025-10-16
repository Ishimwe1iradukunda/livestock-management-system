import { api } from "encore.dev/api";
import db from "../db";

export interface CreateFeedingRecordRequest {
  animalId: number;
  feedId?: number;
  feedType?: string; // for backward compatibility
  quantity: number;
  unit?: string;
  feedingDate: Date;
  cost?: number;
  notes?: string;
}

export interface FeedingRecord {
  id: number;
  animalId: number;
  feedId?: number;
  feedName?: string;
  feedType: string;
  quantity: number;
  unit: string;
  feedingDate: Date;
  cost: number;
  nutritionalValue: any;
  notes?: string;
  createdAt: Date;
}

// Creates a new feeding record and calculates nutritional information.
export const create = api<CreateFeedingRecordRequest, FeedingRecord>(
  { auth: true, expose: true, method: "POST", path: "/feeding" },
  async (params) => {
    let feedInfo = null;
    let nutritionalValue = {};
    let finalCost = params.cost || 0;
    let feedType = params.feedType || '';
    
    // If feedId is provided, get feed information and calculate nutrition/cost
    if (params.feedId) {
      feedInfo = await db.queryRow<any>`
        SELECT f.*, fi.quantity_on_hand 
        FROM feeds f 
        LEFT JOIN feed_inventory fi ON f.id = fi.feed_id 
        WHERE f.id = ${params.feedId}
      `;
      
      if (!feedInfo) {
        throw new Error("Feed not found");
      }
      
      // Check if enough feed is available
      if (feedInfo.quantity_on_hand < params.quantity) {
        throw new Error(`Insufficient feed available. Only ${feedInfo.quantity_on_hand} ${feedInfo.unit} remaining.`);
      }
      
      feedType = feedInfo.type;
      finalCost = params.cost || (feedInfo.cost_per_unit * params.quantity);
      
      // Calculate nutritional values
      nutritionalValue = {
        protein: (feedInfo.protein_percentage / 100) * params.quantity,
        energy: (feedInfo.energy_value) * params.quantity,
        fiber: (feedInfo.fiber_percentage / 100) * params.quantity,
        fat: (feedInfo.fat_percentage / 100) * params.quantity,
      };
    }
    
    const row = await db.queryRow<any>`
      INSERT INTO feeding_records (
        animal_id, feed_id, feed_type, quantity, unit, feeding_date, 
        cost, nutritional_value, notes
      ) VALUES (
        ${params.animalId}, ${params.feedId}, ${feedType}, ${params.quantity}, 
        ${params.unit || 'kg'}, ${params.feedingDate}, ${finalCost},
        ${JSON.stringify(nutritionalValue)}, ${params.notes}
      ) RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create feeding record");
    }
    
    // Create financial record if cost > 0
    if (finalCost > 0) {
      await db.exec`
        INSERT INTO financial_records (
          transaction_type, category, amount, transaction_date, description, animal_id
        ) VALUES (
          'expense', 'feeding', ${finalCost}, ${params.feedingDate}, 
          'Feeding: ' || ${feedType}, ${params.animalId}
        )
      `;
    }
    
    return {
      id: row.id,
      animalId: row.animal_id,
      feedId: row.feed_id,
      feedName: feedInfo?.name,
      feedType: row.feed_type,
      quantity: row.quantity,
      unit: row.unit,
      feedingDate: row.feeding_date,
      cost: row.cost,
      nutritionalValue: row.nutritional_value,
      notes: row.notes,
      createdAt: row.created_at,
    } as FeedingRecord;
  }
);