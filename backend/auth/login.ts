import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import db from "../db";
import { verifyPassword, generateToken } from "./password";
import type { LoginRequest, LoginResponse } from "./types";

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (params) => {
    if (!params.email || !params.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    // Find user by email
    const userRow = await db.queryRow<any>`
      SELECT * FROM users 
      WHERE email = ${params.email.toLowerCase()} 
        AND is_active = true
    `;

    if (!userRow) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Verify password
    if (!verifyPassword(params.password, userRow.password_hash)) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Generate session token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create session
    await db.exec`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${userRow.id}, ${token}, ${expiresAt})
    `;

    // Update last login
    await db.exec`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${userRow.id}
    `;

    const user = {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role,
      fullName: userRow.full_name,
      isActive: userRow.is_active,
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
      lastLogin: new Date(),
    };

    return {
      user,
      token,
      expiresAt,
    };
  }
);