import { api } from "encore.dev/api";
import db from "../db";

export interface DashboardStats {
  totalAnimals: number;
  activeAnimals: number;
  recentHealthRecords: number;
  totalProduction: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
  upcomingHealthTasks: number;
}

// Retrieves dashboard statistics and key metrics.
export const getDashboardStats = api<void, DashboardStats>(
  { expose: true, method: "GET", path: "/reports/dashboard" },
  async () => {
    // Total and active animals
    const animalStats = await db.queryRow<{ total: number; active: number }>`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active
      FROM animals
    `;
    
    // Recent health records (last 30 days)
    const healthStats = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM health_records 
      WHERE record_date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    
    // Production this month
    const productionStats = await db.queryRow<{ total: number }>`
      SELECT COALESCE(SUM(quantity), 0) as total 
      FROM production_records 
      WHERE production_date >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    
    // Financial stats for current month
    const financialStats = await db.queryRow<{ income: number; expenses: number }>`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM financial_records 
      WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    
    // Upcoming health tasks (next 30 days)
    const upcomingTasks = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM health_records 
      WHERE next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `;
    
    return {
      totalAnimals: animalStats?.total || 0,
      activeAnimals: animalStats?.active || 0,
      recentHealthRecords: healthStats?.count || 0,
      totalProduction: productionStats?.total || 0,
      monthlyIncome: financialStats?.income || 0,
      monthlyExpenses: financialStats?.expenses || 0,
      netProfit: (financialStats?.income || 0) - (financialStats?.expenses || 0),
      upcomingHealthTasks: upcomingTasks?.count || 0,
    };
  }
);
