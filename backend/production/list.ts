import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { ProductionRecord } from "./create";

export interface ListProductionRecordsRequest {
  animalId?: Query<number>;
  productType?: Query<string>;
  startDate?: Query<Date>;
  endDate?: Query<Date>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListProductionRecordsResponse {
  records: ProductionRecord[];
  total: number;
}

// Retrieves production records with optional filtering.
export const list = api<ListProductionRecordsRequest, ListProductionRecordsResponse>(
  { expose: true, method: "GET", path: "/production" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.animalId) {
      whereClause += ` AND pr.animal_id = $${paramIndex}`;
      queryParams.push(params.animalId);
      paramIndex++;
    }
    
    if (params.productType) {
      whereClause += ` AND pr.product_type = $${paramIndex}`;
      queryParams.push(params.productType);
      paramIndex++;
    }
    
    if (params.startDate) {
      whereClause += ` AND pr.production_date >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }
    
    if (params.endDate) {
      whereClause += ` AND pr.production_date <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) as count FROM production_records pr ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...queryParams);
    const total = countResult?.count || 0;
    
    const dataQuery = `
      SELECT pr.*, a.tag_number, a.name as animal_name 
      FROM production_records pr
      JOIN animals a ON pr.animal_id = a.id
      ${whereClause} 
      ORDER BY pr.production_date DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    const records: ProductionRecord[] = rows.map(row => ({
      ...row,
      animalId: row.animal_id,
      productType: row.product_type,
      productionDate: row.production_date,
      qualityGrade: row.quality_grade,
      pricePerUnit: row.price_per_unit,
      totalValue: row.total_value,
      createdAt: row.created_at,
    }));
    
    return { records, total };
  }
);
