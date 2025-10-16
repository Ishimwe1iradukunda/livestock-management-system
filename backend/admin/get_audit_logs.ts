import { api, Query } from "encore.dev/api";
import db from "../db";

export interface GetAuditLogsRequest {
  adminId?: Query<string>;
  action?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface AuditLog {
  id: string;
  adminId: string | null;
  adminEmail: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: Date;
}

export interface GetAuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export const getAuditLogs = api<GetAuditLogsRequest, GetAuditLogsResponse>(
  { auth: true, expose: true, method: "GET", path: "/admin/audit-logs" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (req.adminId) {
      whereClause += ` AND al.admin_id = $${paramIndex}`;
      queryParams.push(req.adminId);
      paramIndex++;
    }

    if (req.action) {
      whereClause += ` AND al.action = $${paramIndex}`;
      queryParams.push(req.action);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND al.created_at >= $${paramIndex}`;
      queryParams.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND al.created_at <= $${paramIndex}`;
      queryParams.push(req.endDate);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM audit_logs al 
      ${whereClause}
    `;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...queryParams);
    const total = countResult?.count || 0;

    const dataQuery = `
      SELECT 
        al.id, al.admin_id, au.email as admin_email, al.action, 
        al.resource_type, al.resource_id, al.details, al.ip_address, al.created_at
      FROM audit_logs al
      LEFT JOIN admin_users au ON al.admin_id = au.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const rows = await db.rawQueryAll<any>(dataQuery, ...queryParams);

    const logs: AuditLog[] = rows.map(row => ({
      id: row.id,
      adminId: row.admin_id,
      adminEmail: row.admin_email,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    }));

    return { logs, total };
  }
);
