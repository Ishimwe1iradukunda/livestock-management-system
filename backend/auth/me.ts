import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";

export interface UserInfoResponse {
  id: string;
  username: string;
  fullName: string | null;
  role: string;
}

export const me = api<void, UserInfoResponse>(
  { auth: true, expose: true, method: "GET", path: "/auth/me" },
  async () => {
    const auth = getAuthData()! as AuthData;
    return {
      id: auth.userID,
      username: auth.username,
      fullName: auth.fullName,
      role: auth.role,
    };
  }
);
