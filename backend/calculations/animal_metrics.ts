import { api } from "encore.dev/api";
import db from "../db";

export interface AnimalMetricsRequest {
  animalId: number;
  startDate?: Date;
  endDate?: Date;
}

export interface AnimalMetrics {
  animalId: number;
  animalTag: string;
  animalName?: string;
  
  // Growth metrics
  currentWeight: number;
  weightGain: number;
  averageDailyGain: number;
  
  // Feed efficiency
  totalFeedConsumed: number;
  feedCostTotal: number;
  feedEfficiencyRatio: number; // weight gain per unit feed
  costPerKgGain: number;
  
  // Health metrics
  healthCostTotal: number;
  healthRecordCount: number;
  vaccinationStatus: string;
  
  // Production metrics
  productionValue: number;
  productionQuantity: number;
  
  // Financial metrics
  totalCosts: number;
  totalRevenue: number;
  netProfit: number;
  roi: number; // Return on investment
  
  // Timeline
  daysOnFarm: number;
  periodDays: number;
}

// Calculates comprehensive metrics for a specific animal.
export const getAnimalMetrics = api<AnimalMetricsRequest, AnimalMetrics>(
  { expose: true, method: "GET", path: "/calculations/animal/:animalId/metrics" },
  async (params) => {
    const endDate = params.endDate || new Date();
    const startDate = params.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days default
    
    // Get animal basic info
    const animal = await db.queryRow<any>`
      SELECT * FROM animals WHERE id = ${params.animalId}
    `;
    
    if (!animal) {
      throw new Error("Animal not found");
    }
    
    // Calculate days
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysOnFarm = animal.purchase_date 
      ? Math.ceil((endDate.getTime() - new Date(animal.purchase_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Get initial weight (earliest record or purchase weight)
    const initialWeight = await db.queryRow<{ weight: number }>`
      SELECT COALESCE(${animal.weight}, 0) as weight
    `;
    
    // Feed consumption and costs
    const feedStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(quantity), 0) as total_feed,
        COALESCE(SUM(cost), 0) as total_cost
      FROM feeding_records 
      WHERE animal_id = ${params.animalId} 
        AND feeding_date BETWEEN ${startDate} AND ${endDate}
    `;
    
    // Health costs
    const healthStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(*) as record_count
      FROM health_records 
      WHERE animal_id = ${params.animalId} 
        AND record_date BETWEEN ${startDate} AND ${endDate}
    `;
    
    // Production value
    const productionStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(total_value), 0) as total_value,
        COALESCE(SUM(quantity), 0) as total_quantity
      FROM production_records 
      WHERE animal_id = ${params.animalId} 
        AND production_date BETWEEN ${startDate} AND ${endDate}
    `;
    
    // Financial records
    const financialStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income
      FROM financial_records 
      WHERE animal_id = ${params.animalId} 
        AND transaction_date BETWEEN ${startDate} AND ${endDate}
    `;
    
    // Latest vaccination check
    const latestVaccination = await db.queryRow<any>`
      SELECT record_date, next_due_date 
      FROM health_records 
      WHERE animal_id = ${params.animalId} 
        AND record_type = 'vaccination' 
      ORDER BY record_date DESC 
      LIMIT 1
    `;
    
    // Calculations
    const currentWeight = animal.weight || 0;
    const initialWeightValue = initialWeight?.weight || currentWeight;
    const weightGain = Math.max(0, currentWeight - initialWeightValue);
    const averageDailyGain = periodDays > 0 ? weightGain / periodDays : 0;
    
    const totalFeedConsumed = feedStats?.total_feed || 0;
    const feedCostTotal = feedStats?.total_cost || 0;
    const feedEfficiencyRatio = totalFeedConsumed > 0 ? weightGain / totalFeedConsumed : 0;
    const costPerKgGain = weightGain > 0 ? feedCostTotal / weightGain : 0;
    
    const healthCostTotal = healthStats?.total_cost || 0;
    const healthRecordCount = healthStats?.record_count || 0;
    
    const productionValue = productionStats?.total_value || 0;
    const productionQuantity = productionStats?.total_quantity || 0;
    
    const totalCosts = (financialStats?.total_expenses || 0) + feedCostTotal + healthCostTotal;
    const totalRevenue = (financialStats?.total_income || 0) + productionValue;
    const netProfit = totalRevenue - totalCosts;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    
    // Vaccination status
    let vaccinationStatus = "Unknown";
    if (latestVaccination) {
      const nextDue = latestVaccination.next_due_date ? new Date(latestVaccination.next_due_date) : null;
      if (nextDue && nextDue > new Date()) {
        vaccinationStatus = "Up to date";
      } else if (nextDue && nextDue <= new Date()) {
        vaccinationStatus = "Overdue";
      } else {
        vaccinationStatus = "Vaccinated";
      }
    }
    
    return {
      animalId: params.animalId,
      animalTag: animal.tag_number,
      animalName: animal.name,
      
      currentWeight,
      weightGain,
      averageDailyGain,
      
      totalFeedConsumed,
      feedCostTotal,
      feedEfficiencyRatio,
      costPerKgGain,
      
      healthCostTotal,
      healthRecordCount,
      vaccinationStatus,
      
      productionValue,
      productionQuantity,
      
      totalCosts,
      totalRevenue,
      netProfit,
      roi,
      
      daysOnFarm,
      periodDays,
    } as AnimalMetrics;
  }
);