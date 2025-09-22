import { api } from "encore.dev/api";
import db from "../db";

export interface AnimalMetricsRequest {
  id: number;
}

export interface AnimalMetrics {
  id: number;
  tagNumber: string;
  name?: string;
  
  // Basic info
  ageInDays: number;
  currentWeight: number;
  weightGain: number;
  averageDailyGain: number;
  
  // Health metrics
  totalHealthCost: number;
  healthRecordCount: number;
  lastHealthRecord?: Date;
  vaccinationStatus: "up_to_date" | "due" | "overdue" | "unknown";
  
  // Production metrics
  totalProduction: number;
  productionValue: number;
  
  // Feed metrics
  totalFeedCost: number;
  feedEfficiency: number;
  
  // Financial metrics
  totalCosts: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
}

// Get comprehensive metrics for a specific animal
export const getAnimalMetrics = api<AnimalMetricsRequest, AnimalMetrics>(
  { expose: true, method: "GET", path: "/animals/:id/metrics" },
  async (params) => {
    // Get animal basic info
    const animal = await db.queryRow<any>`
      SELECT * FROM animals WHERE id = ${params.id}
    `;
    
    if (!animal) {
      throw new Error("Animal not found");
    }
    
    // Calculate age
    const ageInDays = animal.birth_date 
      ? Math.floor((Date.now() - new Date(animal.birth_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Get health metrics
    const healthStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(*) as record_count,
        MAX(record_date) as last_record
      FROM health_records 
      WHERE animal_id = ${params.id}
    `;
    
    // Get latest vaccination
    const latestVaccination = await db.queryRow<any>`
      SELECT record_date, next_due_date 
      FROM health_records 
      WHERE animal_id = ${params.id} 
        AND record_type = 'vaccination' 
      ORDER BY record_date DESC 
      LIMIT 1
    `;
    
    // Determine vaccination status
    let vaccinationStatus: "up_to_date" | "due" | "overdue" | "unknown" = "unknown";
    if (latestVaccination?.next_due_date) {
      const dueDate = new Date(latestVaccination.next_due_date);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue > 30) {
        vaccinationStatus = "up_to_date";
      } else if (daysUntilDue > 0) {
        vaccinationStatus = "due";
      } else {
        vaccinationStatus = "overdue";
      }
    }
    
    // Get production metrics
    const productionStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(quantity), 0) as total_quantity,
        COALESCE(SUM(total_value), 0) as total_value
      FROM production_records 
      WHERE animal_id = ${params.id}
    `;
    
    // Get feeding metrics
    const feedingStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(cost), 0) as total_cost,
        COALESCE(SUM(quantity), 0) as total_quantity
      FROM feeding_records 
      WHERE animal_id = ${params.id}
    `;
    
    // Get financial metrics
    const financialStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income
      FROM financial_records 
      WHERE animal_id = ${params.id}
    `;
    
    // Calculate derived metrics
    const currentWeight = animal.weight || 0;
    const initialWeight = animal.purchase_weight || currentWeight * 0.7; // Estimate if not available
    const weightGain = Math.max(0, currentWeight - initialWeight);
    const averageDailyGain = ageInDays > 0 ? weightGain / ageInDays : 0;
    
    const totalFeedCost = feedingStats?.total_cost || 0;
    const totalFeedQuantity = feedingStats?.total_quantity || 0;
    const feedEfficiency = totalFeedQuantity > 0 ? weightGain / totalFeedQuantity : 0;
    
    const totalHealthCost = healthStats?.total_cost || 0;
    const totalProduction = productionStats?.total_quantity || 0;
    const productionValue = productionStats?.total_value || 0;
    
    const totalCosts = (financialStats?.total_expenses || 0) + totalFeedCost + totalHealthCost;
    const totalRevenue = (financialStats?.total_income || 0) + productionValue;
    const netProfit = totalRevenue - totalCosts;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    
    return {
      id: animal.id,
      tagNumber: animal.tag_number,
      name: animal.name,
      
      ageInDays,
      currentWeight,
      weightGain,
      averageDailyGain,
      
      totalHealthCost,
      healthRecordCount: healthStats?.record_count || 0,
      lastHealthRecord: healthStats?.last_record ? new Date(healthStats.last_record) : undefined,
      vaccinationStatus,
      
      totalProduction,
      productionValue,
      
      totalFeedCost,
      feedEfficiency,
      
      totalCosts,
      totalRevenue,
      netProfit,
      roi,
    };
  }
);