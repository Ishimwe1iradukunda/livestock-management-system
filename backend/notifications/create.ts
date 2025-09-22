import { api } from "encore.dev/api";
import db from "../db";

export interface CreateNotificationRequest {
  type: "health_reminder" | "feed_alert" | "production_milestone" | "financial_alert" | "system_alert";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  entityId?: number;
  entityType?: "animal" | "feed" | "health_record" | "production_record";
  actionUrl?: string;
  scheduledFor?: Date;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  entityId?: number;
  entityType?: string;
  actionUrl?: string;
  isRead: boolean;
  scheduledFor?: Date;
  createdAt: Date;
}

// Create a new notification
export const create = api<CreateNotificationRequest, Notification>(
  { expose: true, method: "POST", path: "/notifications" },
  async (params) => {
    const row = await db.queryRow<any>`
      INSERT INTO notifications (
        type, title, message, priority, entity_id, entity_type, 
        action_url, scheduled_for
      ) VALUES (
        ${params.type}, ${params.title}, ${params.message}, ${params.priority},
        ${params.entityId}, ${params.entityType}, ${params.actionUrl}, ${params.scheduledFor}
      ) RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create notification");
    }
    
    return {
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
    };
  }
);