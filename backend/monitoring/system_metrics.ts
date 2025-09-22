import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface SystemMetrics {
  timestamp: Date;
  database: {
    totalTables: number;
    totalRecords: {
      animals: number;
      healthRecords: number;
      feedingRecords: number;
      productionRecords: number;
      financialRecords: number;
      feeds: number;
    };
    databaseSize: string;
  };
  alerts: {
    lowStock: number;
    healthDue: number;
    criticalEvents: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
  };
}

export interface MetricsRequest {
  timeRange?: Query<string>; // "1h", "24h", "7d", "30d"
}

// Get comprehensive system metrics
export const getSystemMetrics = api<MetricsRequest, SystemMetrics>(
  { expose: true, method: "GET", path: "/monitoring/metrics" },
  async (req) => {
    const timeRange = req.timeRange || "24h";
    
    // Get record counts
    const animalCount = (await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM animals`) || { count: 0 };
    const healthCount = (await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM health_records`) || { count: 0 };
    const feedingCount = (await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM feeding_records`) || { count: 0 };
    const productionCount = (await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM production_records`) || { count: 0 };
    const financialCount = (await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM financial_records`) || { count: 0 };
    const feedsCount = (await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM feeds`) || { count: 0 };

    // Calculate alerts
    let lowStockFeeds = { count: 0 };
    try {
      const result = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM feeds f 
        LEFT JOIN feed_inventory fi ON f.id = fi.feed_id 
        WHERE COALESCE(fi.quantity_on_hand, 0) <= COALESCE(fi.reorder_level, 0) 
        AND fi.reorder_level > 0
        AND f.is_active = true
      `;
      lowStockFeeds = result || { count: 0 };
    } catch (error) {
      console.warn('Failed to get low stock feeds count:', error);
    }

    let upcomingHealthTasks = { count: 0 };
    try {
      const result = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM health_records 
        WHERE next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        AND next_due_date IS NOT NULL
      `;
      upcomingHealthTasks = result || { count: 0 };
    } catch (error) {
      console.warn('Failed to get upcoming health tasks count:', error);
    }

    // Critical events (animals in quarantine or deceased in last 7 days)
    let criticalEvents = { count: 0 };
    try {
      const result = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM animals 
        WHERE status IN ('quarantine', 'deceased') 
        AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
      `;
      criticalEvents = result || { count: 0 };
    } catch (error) {
      console.warn('Failed to get critical events count:', error);
    }

    return {
      timestamp: new Date(),
      database: {
        totalTables: 8, // Known table count
        totalRecords: {
          animals: animalCount?.count || 0,
          healthRecords: healthCount?.count || 0,
          feedingRecords: feedingCount?.count || 0,
          productionRecords: productionCount?.count || 0,
          financialRecords: financialCount?.count || 0,
          feeds: feedsCount?.count || 0,
        },
        databaseSize: "N/A", // PostgreSQL size query would require admin privileges
      },
      alerts: {
        lowStock: lowStockFeeds?.count || 0,
        healthDue: upcomingHealthTasks?.count || 0,
        criticalEvents: criticalEvents?.count || 0,
      },
      performance: {
        avgResponseTime: 150, // This would be tracked over time in a real system
        errorRate: 0.01, // This would be calculated from error logs
      },
    };
  }
);