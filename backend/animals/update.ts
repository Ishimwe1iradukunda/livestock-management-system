import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Animal } from "./create";

export interface UpdateAnimalRequest {
  id: number;
  tagNumber?: string;
  name?: string;
  species?: string;
  breed?: string;
  birthDate?: Date;
  gender?: "male" | "female";
  status?: "active" | "sold" | "deceased" | "quarantine";
  weight?: number;
  color?: string;
  notes?: string;
  purchasePrice?: number;
  supplier?: string;
}

// Updates an existing animal record.
export const update = api<UpdateAnimalRequest, Animal>(
  { expose: true, method: "PUT", path: "/animals/:id" },
  async (params) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const fieldsToUpdate = [
      { field: 'tag_number', value: params.tagNumber },
      { field: 'name', value: params.name },
      { field: 'species', value: params.species },
      { field: 'breed', value: params.breed },
      { field: 'birth_date', value: params.birthDate },
      { field: 'gender', value: params.gender },
      { field: 'status', value: params.status },
      { field: 'weight', value: params.weight },
      { field: 'color', value: params.color },
      { field: 'notes', value: params.notes },
      { field: 'purchase_price', value: params.purchasePrice },
      { field: 'supplier', value: params.supplier },
    ];
    
    fieldsToUpdate.forEach(({ field, value }) => {
      if (value !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
    
    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(params.id);
    
    const query = `
      UPDATE animals 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const row = await db.rawQueryRow<any>(query, ...values);
    
    if (!row) {
      throw APIError.notFound("animal not found");
    }
    
    return {
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
    } as Animal;
  }
);
