import { api, Query, APIError } from "encore.dev/api";
import db from "../db";

export interface ExportRequest {
  reportType: Query<"animals" | "health" | "feeding" | "production" | "financial">;
  startDate?: Query<string>;
  endDate?: Query<string>;
  format?: Query<"json" | "csv">;
}

export interface ExportResponse {
  data: any[];
  recordCount: number;
  format: string;
}

export const exportData = api<ExportRequest, ExportResponse>(
  { auth: true, expose: true, method: "GET", path: "/reports/export" },
  async (req) => {
    const format = req.format || "json";
    let query = "";
    let params: any[] = [];

    switch (req.reportType) {
      case "animals":
        query = "SELECT * FROM animals WHERE 1=1";
        break;
      case "health":
        query = "SELECT * FROM health_records WHERE 1=1";
        break;
      case "feeding":
        query = "SELECT * FROM feeding_records WHERE 1=1";
        break;
      case "production":
        query = "SELECT * FROM production_records WHERE 1=1";
        break;
      case "financial":
        query = "SELECT * FROM financial_records WHERE 1=1";
        break;
      default:
        throw APIError.invalidArgument("invalid report type");
    }

    if (req.startDate && req.endDate) {
      if (req.reportType === "animals") {
        query += " AND created_at >= $1 AND created_at <= $2";
      } else if (req.reportType === "health") {
        query += " AND record_date >= $1 AND record_date <= $2";
      } else if (req.reportType === "feeding") {
        query += " AND feeding_date >= $1 AND feeding_date <= $2";
      } else if (req.reportType === "production") {
        query += " AND production_date >= $1 AND production_date <= $2";
      } else if (req.reportType === "financial") {
        query += " AND transaction_date >= $1 AND transaction_date <= $2";
      }
      params = [req.startDate, req.endDate];
    }

    query += " ORDER BY created_at DESC LIMIT 1000";

    const rows = await db.rawQueryAll<any>(query, ...params);

    return {
      data: rows,
      recordCount: rows.length,
      format,
    };
  }
);
