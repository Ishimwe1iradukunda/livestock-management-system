import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import db from "../db";
import * as bcrypt from "bcryptjs";

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: string;
  fullName: string | null;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    const adminUser = await db.rawQueryRow<{
      id: string;
      email: string;
      role: string;
      full_name: string | null;
      is_active: boolean;
    }>(
      `SELECT id, email, role, full_name, is_active 
       FROM admin_users 
       WHERE id = $1 AND is_active = true`,
      token
    );

    if (!adminUser) {
      throw APIError.unauthenticated("invalid token");
    }

    return {
      userID: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      fullName: adminUser.full_name,
    };
  }
);

export const gw = new Gateway({ authHandler: auth });
