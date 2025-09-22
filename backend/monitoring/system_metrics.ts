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
    const animalCount = await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM animals`;
    const healthCount = await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM health_records`;
    const feedingCount = await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM feeding_records`;
    const productionCount = await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM production_records`;
    const financialCount = await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM financial_records`;
    const feedsCount = await db.queryRow<{ count: number }>`SELECT COUNT(*) as count FROM feeds`;

    // Calculate alerts
    const lowStockFeeds = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM feeds f 
      LEFT JOIN feed_inventory fi ON f.id = fi.feed_id 
      WHERE COALESCE(fi.quantity_on_hand, 0) <= COALESCE(fi.reorder_level, 0) 
      AND fi.reorder_level > 0
    `;

    const upcomingHealthTasks = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM health_records 
      WHERE next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `;

    // Critical events (animals in quarantine or deceased in last 7 days)
    const criticalEvents = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM animals 
      WHERE status IN ('quarantine', 'deceased') 
      AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

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