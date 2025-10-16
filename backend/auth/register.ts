import { api, APIError } from "encore.dev/api";
import db from "../db";
import * as bcrypt from "bcryptjs";

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("email and password are required");
    }

    if (req.password.length < 8) {
      throw APIError.invalidArgument("password must be at least 8 characters");
    }

    const existingUser = await db.rawQueryRow<{ id: string }>(
      `SELECT id FROM admin_users WHERE email = $1`,
      req.email
    );

    if (existingUser) {
      throw APIError.alreadyExists("user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(req.password, 10);

    const newUser = await db.rawQueryRow<{
      id: string;
      email: string;
      full_name: string | null;
      role: string;
    }>(
      `INSERT INTO admin_users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name, role`,
      req.email,
      passwordHash,
      req.fullName || null
    );

    if (!newUser) {
      throw APIError.internal("failed to create user");
    }

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: newUser.role,
    };
  }
);
