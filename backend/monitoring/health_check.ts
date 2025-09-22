import { api } from "encore.dev/api";
import db from "../db";

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: Date;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "healthy" | "unhealthy";
      responseTime: number;
      error?: string;
    };
    services: {
      animals: boolean;
      feeds: boolean;
      health: boolean;
      production: boolean;
      financial: boolean;
    };
  };
}

// Health check endpoint for monitoring system status
export const healthCheck = api<void, HealthStatus>(
  { expose: true, method: "GET", path: "/monitoring/health" },
  async () => {
    const startTime = Date.now();
    let dbStatus: "healthy" | "unhealthy" = "healthy";
    let dbError: string | undefined;
    let dbResponseTime = 0;

    try {
      const dbStartTime = Date.now();
      await db.queryRow`SELECT 1 as test`;
      dbResponseTime = Date.now() - dbStartTime;
    } catch (error) {
      dbStatus = "unhealthy";
      dbError = error instanceof Error ? error.message : "Unknown database error";
      dbResponseTime = Date.now() - startTime;
    }

    // Check if basic tables exist
    const services = {
      animals: true,
      feeds: true,
      health: true,
      production: true,
      financial: true,
    };

    try {
      await db.queryRow`SELECT COUNT(*) FROM animals LIMIT 1`;
    } catch (error) {
      console.warn('Animals table check failed:', error);
      services.animals = false;
    }

    try {
      await db.queryRow`SELECT COUNT(*) FROM feeds LIMIT 1`;
    } catch (error) {
      console.warn('Feeds table check failed:', error);
      services.feeds = false;
    }

    try {
      await db.queryRow`SELECT COUNT(*) FROM health_records LIMIT 1`;
    } catch (error) {
      console.warn('Health records table check failed:', error);
      services.health = false;
    }

    try {
      await db.queryRow`SELECT COUNT(*) FROM production_records LIMIT 1`;
    } catch (error) {
      console.warn('Production records table check failed:', error);
      services.production = false;
    }

    try {
      await db.queryRow`SELECT COUNT(*) FROM financial_records LIMIT 1`;
    } catch (error) {
      console.warn('Financial records table check failed:', error);
      services.financial = false;
    }

    const allServicesHealthy = Object.values(services).every(s => s);
    const overallStatus = dbStatus === "healthy" && allServicesHealthy ? "healthy" : 
                         dbStatus === "unhealthy" ? "unhealthy" : "degraded";

    return {
      status: overallStatus,
      timestamp: new Date(),
      version: "1.0.0",
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError,
        },
        services,
      },
    };
  }
);