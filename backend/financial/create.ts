import { api } from "encore.dev/api";
import db from "../db";

export interface CreateFinancialRecordRequest {
  transactionType: "income" | "expense";
  category: string;
  amount: number;
  transactionDate: Date;
  description: string;
  animalId?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface FinancialRecord {
  id: number;
  transactionType: "income" | "expense";
  category: string;
  amount: number;
  transactionDate: Date;
  description: string;
  animalId?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
}

// Creates a new financial record.
export const create = api<CreateFinancialRecordRequest, FinancialRecord>(
  { expose: true, method: "POST", path: "/financial" },
  async (params) => {
    const row = await db.queryRow<any>`
      INSERT INTO financial_records (
        transaction_type, category, amount, transaction_date, description,
        animal_id, payment_method, receipt_number, notes
      ) VALUES (
        ${params.transactionType}, ${params.category}, ${params.amount}, ${params.transactionDate},
        ${params.description}, ${params.animalId}, ${params.paymentMethod}, ${params.receiptNumber}, ${params.notes}
      ) RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create financial record");
    }
    
    return {
      ...row,
      transactionType: row.transaction_type,
      transactionDate: row.transaction_date,
      animalId: row.animal_id,
      paymentMethod: row.payment_method,
      receiptNumber: row.receipt_number,
      createdAt: row.created_at,
    };
  }
);
