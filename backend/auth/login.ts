import { api, APIError } from "encore.dev/api";
import db from "../db";
import * as bcrypt from "bcryptjs";

export interface LoginRequest {
  username: string;
  pin: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string | null;
    role: string;
  };
}

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    if (!req.username || !req.pin) {
      throw APIError.invalidArgument("username and pin are required");
    }

    if (!/^\d{4}$/.test(req.pin)) {
      throw APIError.invalidArgument("pin must be exactly 4 digits");
    }

    const adminUser = await db.rawQueryRow<{
      id: string;
      username: string;
      pin_hash: string;
      full_name: string | null;
      role: string;
      is_active: boolean;
    }>(
      `SELECT id, username, pin_hash, full_name, role, is_active 
       FROM admin_users 
       WHERE username = $1`,
      req.username
    );

    if (!adminUser || !adminUser.is_active) {
      throw APIError.unauthenticated("invalid credentials");
    }

    const isValidPin = await bcrypt.compare(req.pin, adminUser.pin_hash);
    if (!isValidPin) {
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
        username: adminUser.username,
        fullName: adminUser.full_name,
        role: adminUser.role,
      },
    };
  }
);
