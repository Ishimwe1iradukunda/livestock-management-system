import { api } from "encore.dev/api";
import db from "../db";

export interface CreateHealthRecordRequest {
  animalId: number;
  recordDate: Date;
  recordType: "vaccination" | "treatment" | "checkup" | "illness" | "injury" | "medication";
  description: string;
  veterinarian?: string;
  cost?: number;
  nextDueDate?: Date;
  notes?: string;
}

export interface HealthRecord {
  id: number;
  animalId: number;
  recordDate: Date;
  recordType: string;
  description: string;
  veterinarian?: string;
  cost: number;
  nextDueDate?: Date;
  notes?: string;
  createdAt: Date;
}

// Creates a new health record for an animal.
export const create = api<CreateHealthRecordRequest, HealthRecord>(
  { expose: true, method: "POST", path: "/health" },
  async (params) => {
    const row = await db.queryRow<any>`
      INSERT INTO health_records (
        animal_id, record_date, record_type, description, 
        veterinarian, cost, next_due_date, notes
      ) VALUES (
        ${params.animalId}, ${params.recordDate}, ${params.recordType}, ${params.description},
        ${params.veterinarian}, ${params.cost || 0}, ${params.nextDueDate}, ${params.notes}
      ) RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create health record");
    }
    
    return {
      ...row,
      animalId: row.animal_id,
      recordDate: row.record_date,
      recordType: row.record_type,
      nextDueDate: row.next_due_date,
      createdAt: row.created_at,
    };
  }
);
