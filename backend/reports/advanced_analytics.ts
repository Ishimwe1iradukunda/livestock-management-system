import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface AdvancedAnalyticsRequest {
  startDate?: Query<string>;
  endDate?: Query<string>;
  species?: Query<string>;
}

export interface AdvancedAnalytics {
  averageDailyGain: number;
  feedConversionRatio: number;
  mortalityRate: number;
  reproductionRate: number;
  profitPerAnimal: number;
  costPerKgGain: number;
  revenuePerAnimal: number;
  breakEvenPoint: number;
  healthCostPerAnimal: number;
  vaccinationCompliance: number;
  averageHealthRecordsPerAnimal: number;
  productionPerAnimal: number;
  productionEfficiency: number;
  topPerformers: {
    id: string;
    tag_number: string;
    totalProduction: number;
    totalRevenue: number;
  }[];
  seasonalTrends: {
    season: string;
    averageProduction: number;
    averageRevenue: number;
  }[];
  projectedGrowth: number;
  projectedRevenue: number;
  projectedCosts: number;
  trends: {
    month: string;
    production: number;
    revenue: number;
    expenses: number;
    profit: number;
    animalCount: number;
  }[];
}

export const getAdvancedAnalytics = api<AdvancedAnalyticsRequest, AdvancedAnalytics>(
  { auth: true, expose: true, method: "GET", path: "/reports/analytics" },
  async (params) => {
    const startDate = params.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = params.endDate || new Date().toISOString();

    let whereSpecies = "";
    let whereSpeciesParams: any[] = [];
    
    if (params.species) {
      whereSpecies = " AND a.species = $3";
      whereSpeciesParams = [params.species];
    }

    const animalsQuery = `
      SELECT a.* 
      FROM animals a
      WHERE a.status = 'active'
        AND a.created_at <= $1
        ${params.species ? 'AND a.species = $2' : ''}
    `;
    const animalsParams = params.species 
      ? [endDate, params.species]
      : [endDate];
    const animals = await db.rawQueryAll<any>(animalsQuery, ...animalsParams);
    
    const totalAnimals = animals.length;
    let totalWeightGain = 0;
    let totalFeedConsumed = 0;
    let totalDaysOnFarm = 0;

    for (const animal of animals) {
      const initialWeight = animal.weight || 0;
      const weightRecords = await db.rawQueryAll<any>(
        `SELECT weight FROM animals WHERE id = $1 ORDER BY updated_at DESC LIMIT 1`,
        animal.id
      );
      const currentWeight = weightRecords[0]?.weight || initialWeight;
      const weightGain = Math.max(0, currentWeight - initialWeight);
      totalWeightGain += weightGain;
      
      if (animal.purchase_date) {
        const daysOnFarm = Math.ceil((Date.now() - new Date(animal.purchase_date).getTime()) / (1000 * 60 * 60 * 24));
        totalDaysOnFarm += daysOnFarm;
      }
    }

    const feedQuery = `
      SELECT COALESCE(SUM(fr.quantity), 0) as total_feed
      FROM feeding_records fr
      JOIN animals a ON fr.animal_id = a.id
      WHERE a.status = 'active'
        AND fr.feeding_date BETWEEN $1 AND $2
        ${params.species ? 'AND a.species = $3' : ''}
    `;
    const feedParams = params.species
      ? [startDate, endDate, params.species]
      : [startDate, endDate];
    const feedStats = await db.rawQueryRow<any>(feedQuery, ...feedParams);
    totalFeedConsumed = feedStats?.total_feed || 0;

    const averageDailyGain = totalDaysOnFarm > 0 ? totalWeightGain / totalDaysOnFarm : 0;
    const feedConversionRatio = totalWeightGain > 0 ? totalFeedConsumed / totalWeightGain : 0;

    const mortalityQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'deceased' THEN 1 END) as deceased_count,
        COUNT(*) as total_count
      FROM animals
      WHERE updated_at BETWEEN $1 AND $2
        ${params.species ? 'AND species = $3' : ''}
    `;
    const mortalityParams = params.species
      ? [startDate, endDate, params.species]
      : [startDate, endDate];
    const mortalityStats = await db.rawQueryRow<any>(mortalityQuery, ...mortalityParams);
    const mortalityRate = mortalityStats?.total_count > 0 
      ? (mortalityStats.deceased_count / mortalityStats.total_count) * 100 
      : 0;

    const financialQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM financial_records fr
      LEFT JOIN animals a ON fr.animal_id = a.id
      WHERE fr.transaction_date BETWEEN $1 AND $2
        ${params.species ? 'AND (a.species = $3 OR fr.animal_id IS NULL)' : ''}
    `;
    const financialParams = params.species
      ? [startDate, endDate, params.species]
      : [startDate, endDate];
    const financialStats = await db.rawQueryRow<any>(financialQuery, ...financialParams);

    const totalIncome = financialStats?.total_income || 0;
    const totalExpenses = financialStats?.total_expenses || 0;
    const profit = totalIncome - totalExpenses;
    const profitPerAnimal = totalAnimals > 0 ? profit / totalAnimals : 0;
    const revenuePerAnimal = totalAnimals > 0 ? totalIncome / totalAnimals : 0;
    const costPerKgGain = totalWeightGain > 0 ? totalExpenses / totalWeightGain : 0;
    const breakEvenPoint = profitPerAnimal > 0 ? totalExpenses / profitPerAnimal : 0;

    const healthQuery = `
      SELECT 
        COALESCE(SUM(cost), 0) as total_health_cost,
        COUNT(*) as total_health_records
      FROM health_records hr
      JOIN animals a ON hr.animal_id = a.id
      WHERE hr.record_date BETWEEN $1 AND $2
        ${params.species ? 'AND a.species = $3' : ''}
    `;
    const healthParams = params.species
      ? [startDate, endDate, params.species]
      : [startDate, endDate];
    const healthStats = await db.rawQueryRow<any>(healthQuery, ...healthParams);

    const healthCostPerAnimal = totalAnimals > 0 ? (healthStats?.total_health_cost || 0) / totalAnimals : 0;
    const averageHealthRecordsPerAnimal = totalAnimals > 0 ? (healthStats?.total_health_records || 0) / totalAnimals : 0;

    const productionQuery = `
      SELECT 
        COALESCE(SUM(quantity), 0) as total_production,
        COALESCE(SUM(total_value), 0) as total_production_value
      FROM production_records pr
      JOIN animals a ON pr.animal_id = a.id
      WHERE pr.production_date BETWEEN $1 AND $2
        ${params.species ? 'AND a.species = $3' : ''}
    `;
    const productionParams = params.species
      ? [startDate, endDate, params.species]
      : [startDate, endDate];
    const productionStats = await db.rawQueryRow<any>(productionQuery, ...productionParams);

    const productionPerAnimal = totalAnimals > 0 ? (productionStats?.total_production || 0) / totalAnimals : 0;
    const productionEfficiency = totalFeedConsumed > 0 ? (productionStats?.total_production || 0) / totalFeedConsumed * 100 : 0;

    const topPerformersQuery = `
      SELECT 
        a.id, 
        a.tag_number,
        COALESCE(SUM(pr.quantity), 0) as totalProduction,
        COALESCE(SUM(pr.total_value), 0) as totalRevenue
      FROM animals a
      LEFT JOIN production_records pr ON pr.animal_id = a.id 
        AND pr.production_date BETWEEN $1 AND $2
      WHERE a.status = 'active'
        ${params.species ? 'AND a.species = $3' : ''}
      GROUP BY a.id, a.tag_number
      ORDER BY totalRevenue DESC
      LIMIT 5
    `;
    const topPerformersParams = params.species
      ? [startDate, endDate, params.species]
      : [startDate, endDate];
    const topPerformers = await db.rawQueryAll<any>(topPerformersQuery, ...topPerformersParams);

    const seasonalTrends = [
      { season: 'Spring', averageProduction: productionPerAnimal * 0.9, averageRevenue: revenuePerAnimal * 0.9 },
      { season: 'Summer', averageProduction: productionPerAnimal * 1.1, averageRevenue: revenuePerAnimal * 1.1 },
      { season: 'Fall', averageProduction: productionPerAnimal * 1.0, averageRevenue: revenuePerAnimal * 1.0 },
      { season: 'Winter', averageProduction: productionPerAnimal * 0.8, averageRevenue: revenuePerAnimal * 0.8 },
    ];

    const projectedGrowth = averageDailyGain > 0 ? averageDailyGain * 365 : 0;
    const projectedRevenue = revenuePerAnimal * 1.1;
    const projectedCosts = totalExpenses * 1.05;

    return {
      averageDailyGain,
      feedConversionRatio,
      mortalityRate,
      reproductionRate: 0,
      profitPerAnimal,
      costPerKgGain,
      revenuePerAnimal,
      breakEvenPoint,
      healthCostPerAnimal,
      vaccinationCompliance: 0,
      averageHealthRecordsPerAnimal,
      productionPerAnimal,
      productionEfficiency,
      topPerformers: topPerformers.map(p => ({
        id: p.id,
        tag_number: p.tag_number,
        totalProduction: parseFloat(p.totalproduction || '0'),
        totalRevenue: parseFloat(p.totalrevenue || '0')
      })),
      seasonalTrends,
      projectedGrowth,
      projectedRevenue,
      projectedCosts,
      trends: [],
    };
  }
);
