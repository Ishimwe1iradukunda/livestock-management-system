import { api } from "encore.dev/api";
import db from "../db";

export interface CreateProductionRecordRequest {
  animalId: number;
  productType: string;
  quantity: number;
  unit: string;
  productionDate: Date;
  qualityGrade?: string;
  pricePerUnit?: number;
  notes?: string;
}

export interface ProductionRecord {
  id: number;
  animalId: number;
  productType: string;
  quantity: number;
  unit: string;
  productionDate: Date;
  qualityGrade?: string;
  pricePerUnit: number;
  totalValue: number;
  notes?: string;
  createdAt: Date;
}

// Creates a new production record for an animal.
export const create = api<CreateProductionRecordRequest, ProductionRecord>(
  { expose: true, method: "POST", path: "/production" },
  async (params) => {
    const pricePerUnit = params.pricePerUnit || 0;
    const totalValue = params.quantity * pricePerUnit;
    
    const row = await db.queryRow<any>`
      INSERT INTO production_records (
        animal_id, product_type, quantity, unit, production_date,
        quality_grade, price_per_unit, total_value, notes
      ) VALUES (
        ${params.animalId}, ${params.productType}, ${params.quantity}, ${params.unit},
        ${params.productionDate}, ${params.qualityGrade}, ${pricePerUnit}, ${totalValue}, ${params.notes}
      ) RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create production record");
    }
    
    return {
      ...row,
      animalId: row.animal_id,
      productType: row.product_type,
      productionDate: row.production_date,
      qualityGrade: row.quality_grade,
      pricePerUnit: row.price_per_unit,
      totalValue: row.total_value,
      createdAt: row.created_at,
    };
  }
);
