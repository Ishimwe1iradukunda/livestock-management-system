import { api } from "encore.dev/api";
import db from "../db";

export interface Alert {
  id: string;
  type: "low_stock" | "health_due" | "vaccination_due" | "breeding_due" | "financial";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  entityId?: number;
  entityType?: "animal" | "feed" | "health_record";
  actionRequired: boolean;
  dueDate?: Date;
  createdAt: Date;
}

export interface GetAlertsResponse {
  alerts: Alert[];
  counts: {
    total: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

// Retrieves all active alerts for the farm.
export const getAlerts = api<void, GetAlertsResponse>(
  { expose: true, method: "GET", path: "/alerts" },
  async () => {
    const alerts: Alert[] = [];
    
    // Check for low stock feeds
    const lowStockFeeds = await db.queryAll<any>`
      SELECT f.id, f.name, f.type, fi.quantity_on_hand, fi.reorder_level, f.unit
      FROM feeds f
      JOIN feed_inventory fi ON f.id = fi.feed_id
      WHERE f.is_active = true 
        AND fi.reorder_level > 0 
        AND fi.quantity_on_hand <= fi.reorder_level
    `;
    
    lowStockFeeds.forEach((feed, index) => {
      alerts.push({
        id: `low_stock_${feed.id}`,
        type: "low_stock",
        priority: feed.quantity_on_hand === 0 ? "urgent" : "high",
        title: `Low Stock: ${feed.name}`,
        description: `Only ${feed.quantity_on_hand} ${feed.unit} remaining (reorder at ${feed.reorder_level} ${feed.unit})`,
        entityId: feed.id,
        entityType: "feed",
        actionRequired: true,
        createdAt: new Date(),
      });
    });
    
    // Check for overdue health records
    const overdueHealth = await db.queryAll<any>`
      SELECT hr.id, hr.animal_id, hr.next_due_date, hr.record_type, a.tag_number, a.name
      FROM health_records hr
      JOIN animals a ON hr.animal_id = a.id
      WHERE hr.next_due_date IS NOT NULL 
        AND hr.next_due_date < CURRENT_DATE
        AND a.status = 'active'
    `;
    
    overdueHealth.forEach((record) => {
      const daysPast = Math.ceil((new Date().getTime() - new Date(record.next_due_date).getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `health_overdue_${record.id}`,
        type: "health_due",
        priority: daysPast > 30 ? "urgent" : daysPast > 7 ? "high" : "medium",
        title: `Overdue ${record.record_type}`,
        description: `${record.record_type} for ${record.name || `#${record.tag_number}`} was due ${daysPast} days ago`,
        entityId: record.animal_id,
        entityType: "animal",
        actionRequired: true,
        dueDate: new Date(record.next_due_date),
        createdAt: new Date(),
      });
    });
    
    // Check for upcoming health records (next 7 days)
    const upcomingHealth = await db.queryAll<any>`
      SELECT hr.id, hr.animal_id, hr.next_due_date, hr.record_type, a.tag_number, a.name
      FROM health_records hr
      JOIN animals a ON hr.animal_id = a.id
      WHERE hr.next_due_date IS NOT NULL 
        AND hr.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        AND a.status = 'active'
    `;
    
    upcomingHealth.forEach((record) => {
      const daysUntil = Math.ceil((new Date(record.next_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `health_upcoming_${record.id}`,
        type: "health_due",
        priority: daysUntil <= 1 ? "high" : "medium",
        title: `Upcoming ${record.record_type}`,
        description: `${record.record_type} for ${record.name || `#${record.tag_number}`} due in ${daysUntil} day(s)`,
        entityId: record.animal_id,
        entityType: "animal",
        actionRequired: true,
        dueDate: new Date(record.next_due_date),
        createdAt: new Date(),
      });
    });
    
    // Check for animals with no recent health records (90+ days)
    const noRecentHealth = await db.queryAll<any>`
      SELECT a.id, a.tag_number, a.name, 
        COALESCE(MAX(hr.record_date), a.created_at) as last_health_record
      FROM animals a
      LEFT JOIN health_records hr ON a.id = hr.animal_id
      WHERE a.status = 'active'
      GROUP BY a.id, a.tag_number, a.name, a.created_at
      HAVING COALESCE(MAX(hr.record_date), a.created_at) < CURRENT_DATE - INTERVAL '90 days'
    `;
    
    noRecentHealth.forEach((animal) => {
      const daysSince = Math.ceil((new Date().getTime() - new Date(animal.last_health_record).getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `no_health_${animal.id}`,
        type: "health_due",
        priority: daysSince > 180 ? "high" : "medium",
        title: "Health Check Needed",
        description: `${animal.name || `#${animal.tag_number}`} has no health records for ${daysSince} days`,
        entityId: animal.id,
        entityType: "animal",
        actionRequired: true,
        createdAt: new Date(),
      });
    });
    
    // Calculate counts
    const counts = {
      total: alerts.length,
      urgent: alerts.filter(a => a.priority === "urgent").length,
      high: alerts.filter(a => a.priority === "high").length,
      medium: alerts.filter(a => a.priority === "medium").length,
      low: alerts.filter(a => a.priority === "low").length,
    };
    
    // Sort alerts by priority and date
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return { alerts, counts };
  }
);