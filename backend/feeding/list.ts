import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { FeedingRecord } from "./create";

export interface ListFeedingRecordsRequest {
  animalId?: Query<number>;
  feedId?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListFeedingRecordsResponse {
  records: FeedingRecord[];
  total: number;
  totalCost: number;
  totalNutrition: {
    protein: number;
    energy: number;
    fiber: number;
    fat: number;
  };
}

// Retrieves feeding records with filtering and nutrition summaries.
export const list = api<ListFeedingRecordsRequest, ListFeedingRecordsResponse>(
  { expose: true, method: "GET", path: "/feeding" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.animalId) {
      whereClause += ` AND fr.animal_id = $${paramIndex}`;
      queryParams.push(params.animalId);
      paramIndex++;
    }
    
    if (params.feedId) {
      whereClause += ` AND fr.feed_id = $${paramIndex}`;
      queryParams.push(params.feedId);
      paramIndex++;
    }
    
    if (params.startDate) {
      whereClause += ` AND fr.feeding_date >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }
    
    if (params.endDate) {
      whereClause += ` AND fr.feeding_date <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }
    
    // Get total count and cost
    const summaryQuery = `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(cost), 0) as total_cost
      FROM feeding_records fr 
      ${whereClause}
    `;
    const summaryResult = await db.rawQueryRow<{ count: number; total_cost: number }>(
      summaryQuery, 
      ...queryParams
    );
    
    // Get detailed records
    const dataQuery = `
      SELECT 
        fr.*,
        f.name as feed_name,
        a.tag_number as animal_tag
      FROM feeding_records fr
      LEFT JOIN feeds f ON fr.feed_id = f.id
      LEFT JOIN animals a ON fr.animal_id = a.id
      ${whereClause}
      ORDER BY fr.feeding_date DESC, fr.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    // Calculate total nutrition
    let totalNutrition = { protein: 0, energy: 0, fiber: 0, fat: 0 };
    
    const records: FeedingRecord[] = rows.map(row => {
      const nutrition = row.nutritional_value || {};
      totalNutrition.protein += nutrition.protein || 0;
      totalNutrition.energy += nutrition.energy || 0;
      totalNutrition.fiber += nutrition.fiber || 0;
      totalNutrition.fat += nutrition.fat || 0;
      
      return {
        id: row.id,
        animalId: row.animal_id,
        feedId: row.feed_id,
        feedName: row.feed_name,
        feedType: row.feed_type,
        quantity: row.quantity,
        unit: row.unit,
        feedingDate: row.feeding_date,
        cost: row.cost,
        nutritionalValue: nutrition,
        notes: row.notes,
        createdAt: row.created_at,
      };
    });
    
    return {
      records,
      total: summaryResult?.count || 0,
      totalCost: summaryResult?.total_cost || 0,
      totalNutrition,
    };
  }
);