import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { FeedPurchase } from "./purchase";

export interface ListFeedPurchasesRequest {
  feedId?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface FeedPurchaseWithDetails extends FeedPurchase {
  feedName: string;
  feedType: string;
}

export interface ListFeedPurchasesResponse {
  purchases: FeedPurchaseWithDetails[];
  total: number;
  totalCost: number;
}

// Retrieves feed purchases with filtering.
export const listPurchases = api<ListFeedPurchasesRequest, ListFeedPurchasesResponse>(
  { expose: true, method: "GET", path: "/feeds/purchases" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.feedId) {
      whereClause += ` AND fp.feed_id = $${paramIndex}`;
      queryParams.push(params.feedId);
      paramIndex++;
    }
    
    if (params.startDate) {
      whereClause += ` AND fp.purchase_date >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }
    
    if (params.endDate) {
      whereClause += ` AND fp.purchase_date <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }
    
    // Get summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_cost), 0) as total_cost
      FROM feed_purchases fp 
      ${whereClause}
    `;
    const summaryResult = await db.rawQueryRow<{ count: number; total_cost: number }>(
      summaryQuery, 
      ...queryParams
    );
    
    // Get detailed purchases
    const dataQuery = `
      SELECT 
        fp.*,
        f.name as feed_name,
        f.type as feed_type
      FROM feed_purchases fp
      JOIN feeds f ON fp.feed_id = f.id
      ${whereClause}
      ORDER BY fp.purchase_date DESC, fp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    const purchases: FeedPurchaseWithDetails[] = rows.map(row => ({
      id: row.id,
      feedId: row.feed_id,
      feedName: row.feed_name,
      feedType: row.feed_type,
      supplier: row.supplier,
      quantity: row.quantity,
      unitCost: row.unit_cost,
      totalCost: row.total_cost,
      purchaseDate: row.purchase_date,
      expiryDate: row.expiry_date,
      batchNumber: row.batch_number,
      invoiceNumber: row.invoice_number,
      notes: row.notes,
      createdAt: row.created_at,
    }));
    
    return {
      purchases,
      total: summaryResult?.count || 0,
      totalCost: summaryResult?.total_cost || 0,
    };
  }
);