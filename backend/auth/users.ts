import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import { hashPassword } from "./password";
import { requireAdmin } from "./middleware";
import type { User, CreateUserRequest } from "./types";

export interface CreateUserRequestWithAuth extends CreateUserRequest {
  token: Header<"Authorization">;
}

export interface ListUsersRequest {
  token: Header<"Authorization">;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
}

export interface UpdateUserRequest {
  token: Header<"Authorization">;
  id: string;
  email?: string;
  fullName?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface DeleteUserRequest {
  token: Header<"Authorization">;
  id: string;
}

// Create user (admin only)
export const createUser = api<CreateUserRequestWithAuth, User>(
  { expose: true, method: "POST", path: "/auth/users" },
  async ({ token, ...params }) => {
    const cleanToken = token?.replace('Bearer ', '') || '';
    await requireAdmin(cleanToken);

    if (!params.email || !params.password || !params.fullName) {
      throw APIError.invalidArgument("Email, password, and full name are required");
    }

    // Check if user already exists
    const existingUser = await db.queryRow<any>`
      SELECT id FROM users WHERE email = ${params.email.toLowerCase()}
    `;

    if (existingUser) {
      throw APIError.invalidArgument("User with this email already exists");
    }

    // Hash password
    const passwordHash = hashPassword(params.password);

    // Create user
    const userRow = await db.queryRow<any>`
      INSERT INTO users (email, password_hash, role, full_name)
      VALUES (${params.email.toLowerCase()}, ${passwordHash}, ${params.role || 'user'}, ${params.fullName})
      RETURNING *
    `;

    if (!userRow) {
      throw new Error("Failed to create user");
    }

    return {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role,
      fullName: userRow.full_name,
      isActive: userRow.is_active,
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
      lastLogin: userRow.last_login,
    };
  }
);

// List users (admin only)
export const listUsers = api<ListUsersRequest, ListUsersResponse>(
  { expose: true, method: "GET", path: "/auth/users" },
  async ({ token, limit = 50, offset = 0 }) => {
    const cleanToken = token?.replace('Bearer ', '') || '';
    await requireAdmin(cleanToken);

    const countResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM users
    `;
    const total = countResult?.count || 0;

    const rows = await db.queryAll<any>`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const users: User[] = rows.map(row => ({
      id: row.id,
      email: row.email,
      role: row.role,
      fullName: row.full_name,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLogin: row.last_login,
    }));

    return { users, total };
  }
);

// Update user (admin only)
export const updateUser = api<UpdateUserRequest, User>(
  { expose: true, method: "PUT", path: "/auth/users/:id" },
  async ({ token, id, ...params }) => {
    const cleanToken = token?.replace('Bearer ', '') || '';
    await requireAdmin(cleanToken);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(params.email.toLowerCase());
      paramIndex++;
    }

    if (params.fullName !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(params.fullName);
      paramIndex++;
    }

    if (params.role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      values.push(params.role);
      paramIndex++;
    }

    if (params.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(params.isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const userRow = await db.rawQueryRow<any>(query, ...values);

    if (!userRow) {
      throw APIError.notFound("User not found");
    }

    return {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role,
      fullName: userRow.full_name,
      isActive: userRow.is_active,
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
      lastLogin: userRow.last_login,
    };
  }
);

// Delete user (admin only)
export const deleteUser = api<DeleteUserRequest, { success: boolean }>(
  { expose: true, method: "DELETE", path: "/auth/users/:id" },
  async ({ token, id }) => {
    const cleanToken = token?.replace('Bearer ', '') || '';
    const currentUser = await requireAdmin(cleanToken);

    // Prevent admin from deleting themselves
    if (currentUser.id === id) {
      throw APIError.invalidArgument("Cannot delete your own account");
    }

    await db.exec`DELETE FROM users WHERE id = ${id}`;
    return { success: true };
  }
);