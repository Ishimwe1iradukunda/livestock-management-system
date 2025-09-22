import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: "error" | "warn" | "info" | "debug";
  service: string;
  endpoint?: string;
  message: string;
  stack?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface LogErrorRequest {
  level: "error" | "warn" | "info" | "debug";
  service: string;
  endpoint?: string;
  message: string;
  stack?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface GetLogsRequest {
  level?: Query<string>;
  service?: Query<string>;
  startTime?: Query<string>;
  endTime?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface GetLogsResponse {
  logs: ErrorLog[];
  total: number;
}

// In-memory storage for logs (in production, use a proper logging service)
const errorLogs: ErrorLog[] = [];
let logIdCounter = 1;

// Log an error or event
export const logError = api<LogErrorRequest, { success: boolean }>(
  { expose: true, method: "POST", path: "/monitoring/logs" },
  async (req) => {
    const log: ErrorLog = {
      id: `log_${logIdCounter++}`,
      timestamp: new Date(),
      level: req.level,
      service: req.service,
      endpoint: req.endpoint,
      message: req.message,
      stack: req.stack,
      userId: req.userId,
      metadata: req.metadata,
    };

    errorLogs.push(log);

    // Keep only last 1000 logs to prevent memory issues
    if (errorLogs.length > 1000) {
      errorLogs.splice(0, errorLogs.length - 1000);
    }

    // In production, also log to console for debugging
    if (req.level === "error") {
      console.error(`[${req.service}] ${req.message}`, req.stack);
    } else {
      console.log(`[${req.level.toUpperCase()}] [${req.service}] ${req.message}`);
    }

    return { success: true };
  }
);

// Retrieve error logs with filtering
export const getLogs = api<GetLogsRequest, GetLogsResponse>(
  { expose: true, method: "GET", path: "/monitoring/logs" },
  async (req) => {
    const limit = req.limit || 100;
    const offset = req.offset || 0;
    
    let filteredLogs = [...errorLogs];

    // Apply filters
    if (req.level) {
      filteredLogs = filteredLogs.filter(log => log.level === req.level);
    }

    if (req.service) {
      filteredLogs = filteredLogs.filter(log => log.service === req.service);
    }

    if (req.startTime) {
      const startTime = new Date(req.startTime);
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startTime);
    }

    if (req.endTime) {
      const endTime = new Date(req.endTime);
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endTime);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Paginate
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
    };
  }
);