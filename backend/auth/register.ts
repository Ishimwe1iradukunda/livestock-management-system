import { api, APIError } from "encore.dev/api";
import db from "../db";
import * as bcrypt from "bcryptjs";

export interface RegisterRequest {
  username: string;
  pin: string;
  fullName?: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  fullName: string | null;
  role: string;
}

export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    if (!req.username || !req.pin) {
      throw APIError.invalidArgument("username and pin are required");
    }

    if (!/^\d{4}$/.test(req.pin)) {
      throw APIError.invalidArgument("pin must be exactly 4 digits");
    }

    const existingUser = await db.rawQueryRow<{ id: string }>(
      `SELECT id FROM admin_users WHERE username = $1`,
      req.username
    );

    if (existingUser) {
      throw APIError.alreadyExists("user with this username already exists");
    }

    const pinHash = await bcrypt.hash(req.pin, 10);

    const newUser = await db.rawQueryRow<{
      id: string;
      username: string;
      full_name: string | null;
      role: string;
    }>(
      `INSERT INTO admin_users (username, pin_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, full_name, role`,
      req.username,
      pinHash,
      req.fullName || null
    );

    if (!newUser) {
      throw APIError.internal("failed to create user");
    }

    return {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.full_name,
      role: newUser.role,
    };
  }
);
