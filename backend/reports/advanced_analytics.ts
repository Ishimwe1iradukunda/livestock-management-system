import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface AdvancedAnalyticsRequest {
  startDate?: Query<string>;
  endDate?: Query<string>;
  species?: Query<string>;
}

export interface AdvancedAnalytics {
  // Performance metrics
  averageDailyGain: number;
  feedConversionRatio: number;
  mortalityRate: number;
  reproductionRate: number;
  
  // Financial metrics
  profitPerAnimal: number;
  costPerKgGain: number;
  revenuePerAnimal: number;
  breakEvenPoint: number;
  
  // Health metrics
  healthCostPerAnimal: number;
  vaccinationCompliance: number;
  averageHealthRecordsPerAnimal: number;
  
  // Production metrics
  productionPerAnimal: number;
  productionEfficiency: number;
  seasonalTrends: Array<{
    month: string;
    production: number;
    revenue: number;
    costs: number;
  }>;
  
  // Comparative analysis
  topPerformers: Array<{
    animalId: number;
    tagNumber: string;
    name?: string;
    performanceScore: number;
    roi: number;
  }>;
  
  // Predictions
  projectedGrowth: number;
  projectedRevenue: number;
  projectedCosts: number;
}

// Get advanced analytics and insights
export const getAdvancedAnalytics = api<AdvancedAnalyticsRequest, AdvancedAnalytics>(
  { expose: true, method: "GET", path: "/reports/advanced-analytics" },
  async (params) => {
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    const startDate = params.startDate ? new Date(params.startDate) : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    // Get animals in scope
    const animalsQuery = params.species 
      ? `SELECT * FROM animals WHERE species = '${params.species}' AND status = 'active'`
      : `SELECT * FROM animals WHERE status = 'active'`;
    
    const animals = await db.rawQueryAll<any>(animalsQuery);
    const totalAnimals = animals.length;
    
    if (totalAnimals === 0) {
      // Return empty analytics if no animals
      return {
        averageDailyGain: 0,
        feedConversionRatio: 0,
        mortalityRate: 0,
        reproductionRate: 0,
        profitPerAnimal: 0,
        costPerKgGain: 0,
        revenuePerAnimal: 0,
        breakEvenPoint: 0,
        healthCostPerAnimal: 0,
        vaccinationCompliance: 0,
        averageHealthRecordsPerAnimal: 0,
        productionPerAnimal: 0,
        productionEfficiency: 0,
        seasonalTrends: [],
        topPerformers: [],
        projectedGrowth: 0,
        projectedRevenue: 0,
        projectedCosts: 0,
      };
    }
    
    // Calculate performance metrics
    let totalWeightGain = 0;
    let totalFeedConsumed = 0;
    let totalDaysOnFarm = 0;
    
    for (const animal of animals) {
      const currentWeight = animal.weight || 0;
      const initialWeight = animal.purchase_weight || currentWeight * 0.7;
      const weightGain = Math.max(0, currentWeight - initialWeight);
      totalWeightGain += weightGain;
      
      if (animal.purchase_date) {
        const daysOnFarm = Math.ceil((Date.now() - new Date(animal.purchase_date).getTime()) / (1000 * 60 * 60 * 24));
        totalDaysOnFarm += daysOnFarm;
      }
    }
    
    // Get feed consumption
    const feedStats = await db.queryRow<any>`
      SELECT COALESCE(SUM(quantity), 0) as total_feed
      FROM feeding_records fr
      JOIN animals a ON fr.animal_id = a.id
      WHERE a.status = 'active'
        AND fr.feeding_date BETWEEN ${startDate} AND ${endDate}
        ${params.species ? `AND a.species = '${params.species}'` : ''}
    `;
    
    totalFeedConsumed = feedStats?.total_feed || 0;
    
    const averageDailyGain = totalDaysOnFarm > 0 ? totalWeightGain / totalDaysOnFarm : 0;
    const feedConversionRatio = totalWeightGain > 0 ? totalFeedConsumed / totalWeightGain : 0;
    
    // Calculate mortality rate
    const mortalityStats = await db.queryRow<any>`
      SELECT 
        COUNT(CASE WHEN status = 'deceased' THEN 1 END) as deceased_count,
        COUNT(*) as total_count
      FROM animals
      WHERE updated_at BETWEEN ${startDate} AND ${endDate}
        ${params.species ? `AND species = '${params.species}'` : ''}
    `;
    
    const mortalityRate = mortalityStats?.total_count > 0 
      ? (mortalityStats.deceased_count / mortalityStats.total_count) * 100 
      : 0;
    
    // Calculate reproduction rate
    const reproductionStats = await db.queryRow<any>`
      SELECT COALESCE(SUM(number_of_offspring), 0) as total_offspring
      FROM breeding_records br
      JOIN animals a ON br.mother_id = a.id
      WHERE br.actual_birth_date BETWEEN ${startDate} AND ${endDate}
        ${params.species ? `AND a.species = '${params.species}'` : ''}
    `;
    
    const reproductionRate = totalAnimals > 0 ? (reproductionStats?.total_offspring || 0) / totalAnimals : 0;
    
    // Financial metrics
    const financialStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM financial_records fr
      LEFT JOIN animals a ON fr.animal_id = a.id
      WHERE fr.transaction_date BETWEEN ${startDate} AND ${endDate}
        ${params.species ? `AND (a.species = '${params.species}' OR fr.animal_id IS NULL)` : ''}
    `;
    
    const totalIncome = financialStats?.total_income || 0;
    const totalExpenses = financialStats?.total_expenses || 0;
    const netProfit = totalIncome - totalExpenses;
    
    const profitPerAnimal = totalAnimals > 0 ? netProfit / totalAnimals : 0;
    const revenuePerAnimal = totalAnimals > 0 ? totalIncome / totalAnimals : 0;
    const costPerKgGain = totalWeightGain > 0 ? totalExpenses / totalWeightGain : 0;
    const breakEvenPoint = profitPerAnimal > 0 ? totalExpenses / profitPerAnimal : 0;
    
    // Health metrics
    const healthStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(cost), 0) as total_health_cost,
        COUNT(*) as total_health_records
      FROM health_records hr
      JOIN animals a ON hr.animal_id = a.id
      WHERE hr.record_date BETWEEN ${startDate} AND ${endDate}
        AND a.status = 'active'
        ${params.species ? `AND a.species = '${params.species}'` : ''}
    `;
    
    const healthCostPerAnimal = totalAnimals > 0 ? (healthStats?.total_health_cost || 0) / totalAnimals : 0;
    const averageHealthRecordsPerAnimal = totalAnimals > 0 ? (healthStats?.total_health_records || 0) / totalAnimals : 0;
    
    // Vaccination compliance
    const vaccinationStats = await db.queryRow<any>`
      SELECT COUNT(DISTINCT animal_id) as vaccinated_animals
      FROM health_records hr
      JOIN animals a ON hr.animal_id = a.id
      WHERE hr.record_type = 'vaccination'
        AND hr.record_date >= CURRENT_DATE - INTERVAL '365 days'
        AND a.status = 'active'
        ${params.species ? `AND a.species = '${params.species}'` : ''}
    `;
    
    const vaccinationCompliance = totalAnimals > 0 
      ? ((vaccinationStats?.vaccinated_animals || 0) / totalAnimals) * 100 
      : 0;
    
    // Production metrics
    const productionStats = await db.queryRow<any>`
      SELECT 
        COALESCE(SUM(quantity), 0) as total_production,
        COALESCE(SUM(total_value), 0) as total_production_value
      FROM production_records pr
      JOIN animals a ON pr.animal_id = a.id
      WHERE pr.production_date BETWEEN ${startDate} AND ${endDate}
        AND a.status = 'active'
        ${params.species ? `AND a.species = '${params.species}'` : ''}
    `;
    
    const totalProduction = productionStats?.total_production || 0;
    const productionPerAnimal = totalAnimals > 0 ? totalProduction / totalAnimals : 0;
    const productionEfficiency = totalFeedConsumed > 0 ? totalProduction / totalFeedConsumed : 0;
    
    // Seasonal trends (last 12 months)
    const seasonalTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthlyStats = await db.queryRow<any>`
        SELECT 
          COALESCE(SUM(pr.quantity), 0) as production,
          COALESCE(SUM(pr.total_value), 0) as revenue,
          COALESCE(SUM(fr.amount), 0) as costs
        FROM production_records pr
        JOIN animals a ON pr.animal_id = a.id
        LEFT JOIN financial_records fr ON fr.animal_id = a.id 
          AND fr.transaction_type = 'expense'
          AND fr.transaction_date BETWEEN ${monthStart} AND ${monthEnd}
        WHERE pr.production_date BETWEEN ${monthStart} AND ${monthEnd}
          AND a.status = 'active'
          ${params.species ? `AND a.species = '${params.species}'` : ''}
      `;
      
      seasonalTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        production: monthlyStats?.production || 0,
        revenue: monthlyStats?.revenue || 0,
        costs: monthlyStats?.costs || 0,
      });
    }
    
    // Top performers (top 5 animals by ROI)
    const topPerformersData = await db.rawQueryAll<any>(`
      SELECT 
        a.id,
        a.tag_number,
        a.name,
        COALESCE(SUM(CASE WHEN fr.transaction_type = 'income' THEN fr.amount ELSE 0 END), 0) +
        COALESCE(SUM(pr.total_value), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN fr.transaction_type = 'expense' THEN fr.amount ELSE 0 END), 0) +
        COALESCE(SUM(hr.cost), 0) +
        COALESCE(SUM(feed.cost), 0) as total_costs
      FROM animals a
      LEFT JOIN financial_records fr ON a.id = fr.animal_id
      LEFT JOIN production_records pr ON a.id = pr.animal_id
      LEFT JOIN health_records hr ON a.id = hr.animal_id
      LEFT JOIN feeding_records feed ON a.id = feed.animal_id
      WHERE a.status = 'active'
        ${params.species ? `AND a.species = '${params.species}'` : ''}
      GROUP BY a.id, a.tag_number, a.name
      HAVING total_costs > 0
      ORDER BY (total_revenue - total_costs) / total_costs DESC
      LIMIT 5
    `);
    
    const topPerformers = topPerformersData.map(animal => ({
      animalId: animal.id,
      tagNumber: animal.tag_number,
      name: animal.name,
      performanceScore: animal.total_revenue > 0 ? (animal.total_revenue / animal.total_costs) * 100 : 0,
      roi: animal.total_costs > 0 ? ((animal.total_revenue - animal.total_costs) / animal.total_costs) * 100 : 0,
    }));
    
    // Simple projections based on current trends
    const monthlyGrowthRate = seasonalTrends.length > 1 
      ? (seasonalTrends[seasonalTrends.length - 1].production - seasonalTrends[0].production) / seasonalTrends.length
      : 0;
    
    const projectedGrowth = monthlyGrowthRate * 12; // Annual projection
    const projectedRevenue = totalIncome * 1.1; // 10% growth assumption
    const projectedCosts = totalExpenses * 1.05; // 5% cost increase assumption
    
    return {
      averageDailyGain,
      feedConversionRatio,
      mortalityRate,
      reproductionRate,
      profitPerAnimal,
      costPerKgGain,
      revenuePerAnimal,
      breakEvenPoint,
      healthCostPerAnimal,
      vaccinationCompliance,
      averageHealthRecordsPerAnimal,
      productionPerAnimal,
      productionEfficiency,
      seasonalTrends,
      topPerformers,
      projectedGrowth,
      projectedRevenue,
      projectedCosts,
    };
  }
);