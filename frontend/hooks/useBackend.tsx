import backend from "~backend/client";
import { useAuth } from "../contexts/AuthContext";

export function useBackend() {
  const { token } = useAuth();
  
  if (!token) {
    return backend;
  }
  
  return backend.with({
    auth: () => ({ authorization: `Bearer ${token}` }),
  });
}
