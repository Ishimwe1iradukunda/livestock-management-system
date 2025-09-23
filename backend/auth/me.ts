import { api } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { requireAuth } from "./middleware";
import type { User } from "./types";

export interface MeRequest {
  token: Header<"Authorization">;
}

export const me = api<MeRequest, User>(
  { expose: true, method: "GET", path: "/auth/me" },
  async ({ token }) => {
    const cleanToken = token?.replace('Bearer ', '') || '';
    return await requireAuth(cleanToken);
  }
);