import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { FinancialRecord } from "./create";

export interface ListFinancialRecordsRequest {
  transactionType?: Query<"income" | "expense">;
  category?: Query<string>;
  startDate?: Query<Date>;
  endDate?: Query<Date>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListFinancialRecordsResponse {
  records: FinancialRecord[];
  total: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

// Retrieves financial records with optional filtering and summary statistics.
export const list = api<ListFinancialRecordsRequest, ListFinancialRecordsResponse>(
  { expose: true, method: "GET", path: "/financial" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.transactionType) {
      whereClause += ` AND transaction_type = $${paramIndex}`;
      queryParams.push(params.transactionType);
      paramIndex++;
    }
    
    if (params.category) {
      whereClause += ` AND category = $${paramIndex}`;
      queryParams.push(params.category);
      paramIndex++;
    }
    
    if (params.startDate) {
      whereClause += ` AND transaction_date >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }
    
    if (params.endDate) {
      whereClause += ` AND transaction_date <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }
    
    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM financial_records ${whereClause}
    `;
    const summaryResult = await db.rawQueryRow<{ count: number; total_income: number; total_expenses: number }>(summaryQuery, ...queryParams);
    
    const total = summaryResult?.count || 0;
    const totalIncome = summaryResult?.total_income || 0;
    const totalExpenses = summaryResult?.total_expenses || 0;
    const netProfit = totalIncome - totalExpenses;
    
    // Get paginated records
    const dataQuery = `
      SELECT fr.*, a.tag_number, a.name as animal_name 
      FROM financial_records fr
      LEFT JOIN animals a ON fr.animal_id = a.id
      ${whereClause} 
      ORDER BY fr.transaction_date DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    const records: FinancialRecord[] = rows.map(row => ({
      ...row,
      transactionType: row.transaction_type,
      transactionDate: row.transaction_date,
      animalId: row.animal_id,
      paymentMethod: row.payment_method,
      receiptNumber: row.receipt_number,
      createdAt: row.created_at,
    }));
    
    return { records, total, totalIncome, totalExpenses, netProfit };
  }
);
