import { api, APIError } from "encore.dev/api";
import db from "../db";
import { logAuditEvent } from "../utils/audit_logger";

export interface DeleteAnimalRequest {
  id: number;
}

// Deletes an animal record.
export const deleteAnimal = api<DeleteAnimalRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/animals/:id" },
  async (params) => {
    const existingAnimal = await db.queryRow<{ id: number }>`
      SELECT id FROM animals WHERE id = ${params.id}
    `;
    
    if (!existingAnimal) {
      throw APIError.notFound("animal not found");
    }
    
    await db.exec`
      DELETE FROM animals WHERE id = ${params.id}
    `;
    
    await logAuditEvent({
      action: "delete_animal",
      resourceType: "animal",
      resourceId: params.id.toString(),
    });
  }
);
