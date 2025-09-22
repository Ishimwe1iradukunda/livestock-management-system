import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Notification } from "./create";

export interface ListNotificationsRequest {
  isRead?: Query<boolean>;
  priority?: Query<string>;
  type?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

// List notifications with filtering
export const list = api<ListNotificationsRequest, ListNotificationsResponse>(
  { expose: true, method: "GET", path: "/notifications" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "WHERE (scheduled_for IS NULL OR scheduled_for <= CURRENT_TIMESTAMP)";
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.isRead !== undefined) {
      whereClause += ` AND is_read = $${paramIndex}`;
      queryParams.push(params.isRead);
      paramIndex++;
    }
    
    if (params.priority) {
      whereClause += ` AND priority = $${paramIndex}`;
      queryParams.push(params.priority);
      paramIndex++;
    }
    
    if (params.type) {
      whereClause += ` AND type = $${paramIndex}`;
      queryParams.push(params.type);
      paramIndex++;
    }
    
    // Get total count and unread count
    const countQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread
      FROM notifications ${whereClause}
    `;
    const countResult = await db.rawQueryRow<{ total: number; unread: number }>(
      countQuery, 
      ...queryParams
    );
    
    // Get notifications
    const dataQuery = `
      SELECT * FROM notifications ${whereClause}
      ORDER BY 
        CASE priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    
    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);
    
    const notifications: Notification[] = rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      priority: row.priority,
      entityId: row.entity_id,
      entityType: row.entity_type,
      actionUrl: row.action_url,
      isRead: row.is_read,
      scheduledFor: row.scheduled_for,
      createdAt: row.created_at,
    }));
    
    return {
      notifications,
      total: countResult?.total || 0,
      unreadCount: countResult?.unread || 0,
    };
  }
);