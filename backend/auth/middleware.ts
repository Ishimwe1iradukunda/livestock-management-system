import { APIError } from "encore.dev/api";
import db from "../db";
import type { User } from "./types";

export async function validateSession(token: string): Promise<User | null> {
  if (!token) {
    return null;
  }

  try {
    const sessionRow = await db.queryRow<any>`
      SELECT s.*, u.id as user_id, u.email, u.role, u.full_name, u.is_active, 
             u.created_at as user_created_at, u.updated_at, u.last_login
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${token} 
        AND s.expires_at > NOW()
        AND u.is_active = true
    `;

    if (!sessionRow) {
      return null;
    }

    return {
      id: sessionRow.user_id,
      email: sessionRow.email,
      role: sessionRow.role,
      fullName: sessionRow.full_name,
      isActive: sessionRow.is_active,
      createdAt: sessionRow.user_created_at,
      updatedAt: sessionRow.updated_at,
      lastLogin: sessionRow.last_login,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function requireAuth(token?: string): Promise<User> {
  const user = await validateSession(token || '');
  if (!user) {
    throw APIError.unauthenticated("Authentication required");
  }
  return user;
}

export async function requireAdmin(token?: string): Promise<User> {
  const user = await requireAuth(token);
  if (user.role !== 'admin') {
    throw APIError.permissionDenied("Admin access required");
  }
  return user;
}