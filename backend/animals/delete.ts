import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface DeleteAnimalRequest {
  id: number;
}

// Deletes an animal record.
export const deleteAnimal = api<DeleteAnimalRequest, void>(
  { expose: true, method: "DELETE", path: "/animals/:id" },
  async (params) => {
    const result = await db.exec`
      DELETE FROM animals WHERE id = ${params.id}
    `;
    
    // Note: SQLDatabase doesn't return affected rows count, so we'll assume success
    // In a real implementation, you might want to check if the animal exists first
  }
);
