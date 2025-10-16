import { api, APIError } from "encore.dev/api";
import db from "../db";
import { validateRequired } from "../utils/validation";
import { logAuditEvent } from "../utils/audit_logger";

export interface CreateAnimalRequest {
  tagNumber: string;
  name?: string;
  species: string;
  breed?: string;
  birthDate?: Date;
  gender?: "male" | "female";
  weight?: number;
  color?: string;
  notes?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  supplier?: string;
}

export interface Animal {
  id: number;
  tagNumber: string;
  name?: string;
  species: string;
  breed?: string;
  birthDate?: Date;
  gender?: "male" | "female";
  status: string;
  weight?: number;
  color?: string;
  notes?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new animal record.
export const create = api<CreateAnimalRequest, Animal>(
  { auth: true, expose: true, method: "POST", path: "/animals" },
  async (params) => {
    validateRequired(params.tagNumber, "tagNumber");
    validateRequired(params.species, "species");
    
    const row = await db.queryRow<any>`
      INSERT INTO animals (
        tag_number, name, species, breed, birth_date, gender, 
        weight, color, notes, purchase_date, purchase_price, supplier
      ) VALUES (
        ${params.tagNumber}, ${params.name}, ${params.species}, ${params.breed}, 
        ${params.birthDate}, ${params.gender}, ${params.weight}, ${params.color}, 
        ${params.notes}, ${params.purchaseDate}, ${params.purchasePrice}, ${params.supplier}
      ) RETURNING *
    `;
    
    if (!row) {
      throw APIError.internal("Failed to create animal");
    }
    
    await logAuditEvent({
      action: "create_animal",
      resourceType: "animal",
      resourceId: row.id.toString(),
      details: { tagNumber: params.tagNumber, species: params.species },
    });
    
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
