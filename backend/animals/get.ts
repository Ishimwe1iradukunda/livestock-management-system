import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Animal } from "./create";

export interface GetAnimalRequest {
  id: number;
}

// Retrieves a specific animal by ID.
export const get = api<GetAnimalRequest, Animal>(
  { expose: true, method: "GET", path: "/animals/:id" },
  async (params) => {
    const row = await db.queryRow<any>`
      SELECT * FROM animals WHERE id = ${params.id}
    `;
    
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
