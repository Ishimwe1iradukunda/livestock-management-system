import { api } from "encore.dev/api";
import { Header } from "encore.dev/api";
import db from "../db";

export interface LogoutRequest {
  token: Header<"Authorization">;
}

export const logout = api<LogoutRequest, { success: boolean }>(
  { expose: true, method: "POST", path: "/auth/logout" },
  async ({ token }) => {
    if (token) {
      // Remove Bearer prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      // Delete the session
      await db.exec`
        DELETE FROM sessions WHERE token = ${cleanToken}
      `;
    }

    return { success: true };
  }
);