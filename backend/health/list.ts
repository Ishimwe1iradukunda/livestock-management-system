import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { HealthRecord } from "./create";

export interface ListHealthRecordsRequest {
  animalId?: Query<number>;
  recordType?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListHealthRecordsResponse {
  records: HealthRecord[];
  total: number;
}

// Retrieves health records with optional filtering.
export const list = api<ListHealthRecordsRequest, ListHealthRecordsResponse>(
  { expose: true, method: "GET", path: "/health" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.animalId) {
      whereClause += ` AND animal_id = $${paramIndex}`;
      queryParams.push(params.animalId);
      paramIndex++;
    }
    
    if (params.recordType) {
      whereClause += ` AND record_type = $${paramIndex}`;
      queryParams.push(params.recordType);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) as count FROM health_records ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...queryParams);
    const total = countResult?.count || 0;
    
    const dataQuery = `
      SELECT hr.*, a.tag_number, a.name as animal_name 
      FROM health_records hr
      JOIN animals a ON hr.animal_id = a.id
      ${whereClause} 
      ORDER BY hr.record_date DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    const records: HealthRecord[] = rows.map(row => ({
      ...row,
      animalId: row.animal_id,
      recordDate: row.record_date,
      recordType: row.record_type,
      nextDueDate: row.next_due_date,
      createdAt: row.created_at,
    }));
    
    return { records, total };
  }
);
