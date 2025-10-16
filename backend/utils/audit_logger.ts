import db from "../db";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";

export interface AuditLogParams {
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    const auth = getAuthData() as AuthData | null;
    
    await db.exec`
      INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, details, ip_address)
      VALUES (
        ${auth?.userID || null},
        ${params.action},
        ${params.resourceType || null},
        ${params.resourceId || null},
        ${params.details ? JSON.stringify(params.details) : null},
        ${params.ipAddress || null}
      )
    `;
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
