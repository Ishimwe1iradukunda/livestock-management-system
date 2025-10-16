import { api, APIError } from "encore.dev/api";
import db from "../db";
import * as bcrypt from "bcryptjs";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
  };
}

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("email and password are required");
    }

    const adminUser = await db.rawQueryRow<{
      id: string;
      email: string;
      password_hash: string;
      full_name: string | null;
      role: string;
      is_active: boolean;
    }>(
      `SELECT id, email, password_hash, full_name, role, is_active 
       FROM admin_users 
       WHERE email = $1`,
      req.email
    );

    if (!adminUser || !adminUser.is_active) {
      throw APIError.unauthenticated("invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(req.password, adminUser.password_hash);
    if (!isValidPassword) {
      throw APIError.unauthenticated("invalid credentials");
    }

    await db.rawExec(
      `UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      adminUser.id
    );

    return {
      token: adminUser.id,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.full_name,
        role: adminUser.role,
      },
    };
  }
);
