import { api } from "encore.dev/api";
import db from "../db";

export interface CreateFeedPurchaseRequest {
  feedId: number;
  supplier?: string;
  quantity: number;
  unitCost: number;
  purchaseDate: Date;
  expiryDate?: Date;
  batchNumber?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface FeedPurchase {
  id: number;
  feedId: number;
  supplier?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: Date;
  expiryDate?: Date;
  batchNumber?: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: Date;
}

// Records a feed purchase and updates inventory.
export const purchase = api<CreateFeedPurchaseRequest, FeedPurchase>(
  { auth: true, expose: true, method: "POST", path: "/feeds/purchase" },
  async (params) => {
    const totalCost = params.quantity * params.unitCost;
    
    const row = await db.queryRow<any>`
      INSERT INTO feed_purchases (
        feed_id, supplier, quantity, unit_cost, total_cost, purchase_date,
        expiry_date, batch_number, invoice_number, notes
      ) VALUES (
        ${params.feedId}, ${params.supplier}, ${params.quantity}, ${params.unitCost},
        ${totalCost}, ${params.purchaseDate}, ${params.expiryDate},
        ${params.batchNumber}, ${params.invoiceNumber}, ${params.notes}
      ) RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to record feed purchase");
    }
    
    // Create financial record for the expense
    await db.exec`
      INSERT INTO financial_records (
        transaction_type, category, amount, transaction_date, description, payment_method
      ) VALUES (
        'expense', 'feed', ${totalCost}, ${params.purchaseDate}, 
        'Feed purchase: ' || (SELECT name FROM feeds WHERE id = ${params.feedId}),
        'cash'
      )
    `;
    
    return {
      id: row.id,
      feedId: row.feed_id,
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
    } as FeedPurchase;
  }
);