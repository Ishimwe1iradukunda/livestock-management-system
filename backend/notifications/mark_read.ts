import { api } from "encore.dev/api";
import db from "../db";

export interface MarkReadRequest {
  id: number;
}

export interface MarkAllReadRequest {
  type?: string;
}

// Mark a notification as read
export const markRead = api<MarkReadRequest, { success: boolean }>(
  { expose: true, method: "PUT", path: "/notifications/:id/read" },
  async (params) => {
    await db.exec`
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
    `;
    
    return { success: true };
  }
);

// Mark all notifications as read
export const markAllRead = api<MarkAllReadRequest, { success: boolean }>(
  { expose: true, method: "PUT", path: "/notifications/mark-all-read" },
  async (params) => {
    let query = `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE is_read = false`;
    
    if (params.type) {
      query += ` AND type = '${params.type}'`;
    }
    
    await db.rawExec(query);
    
    return { success: true };
  }
);