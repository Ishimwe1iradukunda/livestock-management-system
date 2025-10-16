import { api, APIError } from "encore.dev/api";
import db from "../db";
import { logAuditEvent } from "../utils/audit_logger";

export interface BatchDeleteRequest {
  animalIds: number[];
}

export interface BatchDeleteResponse {
  deletedCount: number;
}

export const batchDelete = api<BatchDeleteRequest, BatchDeleteResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/animals/batch" },
  async (req) => {
    if (!req.animalIds || req.animalIds.length === 0) {
      throw APIError.invalidArgument("animalIds array cannot be empty");
    }

    const result = await db.rawQueryAll<{ id: number }>(
      `DELETE FROM animals WHERE id = ANY($1) RETURNING id`,
      req.animalIds
    );

    await logAuditEvent({
      action: "batch_delete_animals",
      resourceType: "animal",
      details: { 
        animalIds: req.animalIds,
        deletedCount: result.length,
      },
    });

    return {
      deletedCount: result.length,
    };
  }
);
