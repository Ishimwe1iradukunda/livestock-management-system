import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Animal } from "./create";

export interface ListAnimalsRequest {
  species?: Query<string>;
  status?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListAnimalsResponse {
  animals: Animal[];
  total: number;
}

// Retrieves all animals with optional filtering.
export const list = api<ListAnimalsRequest, ListAnimalsResponse>(
  { expose: true, method: "GET", path: "/animals" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.species) {
      whereClause += ` AND species = $${paramIndex}`;
      queryParams.push(params.species);
      paramIndex++;
    }
    
    if (params.status) {
      whereClause += ` AND status = $${paramIndex}`;
      queryParams.push(params.status);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) as count FROM animals ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...queryParams);
    const total = countResult?.count || 0;
    
    const dataQuery = `
      SELECT * FROM animals ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    const animals: Animal[] = rows.map(row => ({
      id: row.id,
      tagNumber: row.tag_number,
      name: row.name,
      species: row.species,
      breed: row.breed,
      birthDate: row.birth_date,
      gender: row.gender,
      status: row.status,
      weight: row.weight,
      color: row.color,
      notes: row.notes,
      purchaseDate: row.purchase_date,
      purchasePrice: row.purchase_price,
      supplier: row.supplier,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    
    return { animals, total };
  }
);
