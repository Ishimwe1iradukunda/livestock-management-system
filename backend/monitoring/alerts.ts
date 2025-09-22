import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface Alert {
  id: string;
  type: "low_stock" | "health_due" | "critical_status" | "system_error";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  entityId?: string;
  entityType?: "animal" | "feed" | "health_record";
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export interface AlertsRequest {
  severity?: Query<string>;
  type?: Query<string>;
  acknowledged?: Query<boolean>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface AlertsResponse {
  alerts: Alert[];
  total: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    unacknowledged: number;
  };
}

// Get system alerts and warnings
export const getAlerts = api<AlertsRequest, AlertsResponse>(
  { expose: true, method: "GET", path: "/monitoring/alerts" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    const alerts: Alert[] = [];
    let alertId = 1;

    // Check for low stock feeds
    const lowStockFeeds = await db.queryAll<{
      id: number;
      name: string;
      quantity_on_hand: number;
      reorder_level: number;
    }>`
      SELECT f.id, f.name, 
             COALESCE(fi.quantity_on_hand, 0) as quantity_on_hand,
             COALESCE(fi.reorder_level, 0) as reorder_level
      FROM feeds f 
      LEFT JOIN feed_inventory fi ON f.id = fi.feed_id 
      WHERE COALESCE(fi.quantity_on_hand, 0) <= COALESCE(fi.reorder_level, 0) 
      AND fi.reorder_level > 0
      AND f.is_active = true
    `;

    for (const feed of lowStockFeeds) {
      alerts.push({
        id: `low_stock_${alertId++}`,
        type: "low_stock",
        severity: feed.quantity_on_hand === 0 ? "critical" : "high",
        title: "Low Feed Stock",
        message: `Feed "${feed.name}" is running low (${feed.quantity_on_hand} units remaining, reorder at ${feed.reorder_level})`,
        entityId: feed.id.toString(),
        entityType: "feed",
        createdAt: new Date(),
        acknowledged: false,
      });
    }

    // Check for upcoming health tasks
    const upcomingHealth = await db.queryAll<{
      id: number;
      animal_id: number;
      treatment_type: string;
      next_due_date: Date;
      animal_name: string;
      tag_number: string;
    }>`
      SELECT hr.id, hr.animal_id, hr.treatment_type, hr.next_due_date,
             a.name as animal_name, a.tag_number
      FROM health_records hr
      JOIN animals a ON hr.animal_id = a.id
      WHERE hr.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY hr.next_due_date ASC
    `;

    for (const health of upcomingHealth) {
      const daysUntilDue = Math.ceil((health.next_due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `health_due_${alertId++}`,
        type: "health_due",
        severity: daysUntilDue <= 1 ? "high" : daysUntilDue <= 3 ? "medium" : "low",
        title: "Health Treatment Due",
        message: `${health.treatment_type} due for ${health.animal_name || health.tag_number} in ${daysUntilDue} day(s)`,
        entityId: health.id.toString(),
        entityType: "health_record",
        createdAt: new Date(),
        acknowledged: false,
      });
    }

    // Check for animals with critical status
    const criticalAnimals = await db.queryAll<{
      id: number;
      name: string;
      tag_number: string;
      status: string;
      updated_at: Date;
    }>`
      SELECT id, name, tag_number, status, updated_at
      FROM animals 
      WHERE status IN ('quarantine', 'deceased') 
      AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    for (const animal of criticalAnimals) {
      alerts.push({
        id: `critical_status_${alertId++}`,
        type: "critical_status",
        severity: animal.status === "deceased" ? "critical" : "high",
        title: `Animal Status: ${animal.status}`,
        message: `Animal ${animal.name || animal.tag_number} status changed to ${animal.status}`,
        entityId: animal.id.toString(),
        entityType: "animal",
        createdAt: animal.updated_at,
        acknowledged: false,
      });
    }

    // Apply filters
    let filteredAlerts = alerts;
    
    if (req.severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === req.severity);
    }
    
    if (req.type) {
      filteredAlerts = filteredAlerts.filter(a => a.type === req.type);
    }
    
    if (req.acknowledged !== undefined) {
      filteredAlerts = filteredAlerts.filter(a => a.acknowledged === req.acknowledged);
    }

    // Sort by severity and date
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    filteredAlerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Paginate
    const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);

    // Calculate summary
    const summary = {
      critical: alerts.filter(a => a.severity === "critical").length,
      high: alerts.filter(a => a.severity === "high").length,
      medium: alerts.filter(a => a.severity === "medium").length,
      low: alerts.filter(a => a.severity === "low").length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
    };

    return {
      alerts: paginatedAlerts,
      total: filteredAlerts.length,
      summary,
    };
  }
);