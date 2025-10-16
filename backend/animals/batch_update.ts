import { api, APIError } from "encore.dev/api";
import db from "../db";
import { logAuditEvent } from "../utils/audit_logger";

export interface BatchUpdateRequest {
  animalIds: number[];
  updates: {
    status?: "active" | "sold" | "deceased" | "quarantine";
    weight?: number;
    notes?: string;
  };
}

export interface BatchUpdateResponse {
  updatedCount: number;
  animalIds: number[];
}

export const batchUpdate = api<BatchUpdateRequest, BatchUpdateResponse>(
  { auth: true, expose: true, method: "PUT", path: "/animals/batch" },
  async (req) => {
    if (!req.animalIds || req.animalIds.length === 0) {
      throw APIError.invalidArgument("animalIds array cannot be empty");
    }

    if (!req.updates || Object.keys(req.updates).length === 0) {
      throw APIError.invalidArgument("no updates provided");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.updates.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(req.updates.status);
      paramIndex++;
    }

    if (req.updates.weight !== undefined) {
      updates.push(`weight = $${paramIndex}`);
      values.push(req.updates.weight);
      paramIndex++;
    }

    if (req.updates.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(req.updates.notes);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.animalIds);

    const query = `
      UPDATE animals 
      SET ${updates.join(', ')} 
      WHERE id = ANY($${paramIndex})
      RETURNING id
    `;

    const rows = await db.rawQueryAll<{ id: number }>(query, ...values);

    await logAuditEvent({
      action: "batch_update_animals",
      resourceType: "animal",
      details: { 
        animalIds: req.animalIds, 
        updates: req.updates,
        updatedCount: rows.length,
      },
    });

    return {
      updatedCount: rows.length,
      animalIds: rows.map(r => r.id),
    };
  }
);
