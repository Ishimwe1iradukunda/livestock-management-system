import { api } from "encore.dev/api";
import db from "../db";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface ListAdminsResponse {
  admins: AdminUser[];
}

export const listAdmins = api<void, ListAdminsResponse>(
  { auth: true, expose: true, method: "GET", path: "/admin/users" },
  async () => {
    const rows = await db.rawQueryAll<any>(
      `SELECT id, email, full_name, role, is_active, created_at, last_login 
       FROM admin_users 
       ORDER BY created_at DESC`
    );

    const admins: AdminUser[] = rows.map(row => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    }));

    return { admins };
  }
);
