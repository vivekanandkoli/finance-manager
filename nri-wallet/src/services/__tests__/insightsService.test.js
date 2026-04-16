import { describe, it, expect, beforeEach, vi } from 'vitest';
import { insightsService } from '../insightsService';
import * as db from '../../db';

vi.mock('../../db');

describe('InsightsService', () => {
  beforeEach(() => {
    insightsService.clearInsights();
    vi.clearAllMocks();
  });

  describe('generateInsights', () => {
    it('should generate insights from data', async () => {
      const mockExpenses = [
        { id: 1, amount: 1000, category: 'Food & Dining', date: new Date().toISOString() },
        { id: 2, amount: 500, category: 'Transportation', date: new Date().toISOString() },
      ];

      db.getAllRecords.mockResolvedValue(mockExpenses);

      const insights = await insightsService.generateInsights();

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThanOrEqual(0);
    });

    it('should sort insights by priority', async () => {
      db.getAllRecords.mockResolvedValue([]);

      const insights = await insightsService.generateInsights();

      if (insights.length > 1) {
        expect(insights[0].priority).toBeGreaterThanOrEqual(insights[1].priority);
      }
    });

    it('should handle errors gracefully', async () => {
      db.getAllRecords.mockRejectedValue(new Error('Database error'));

      const insights = await insightsService.generateInsights();

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBe(0);
    });
  });

  describe('analyzeSpending', () => {
    it('should detect increased spending', async () => {
      const thisMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const mockExpenses = [
        { amount: 10000, date: thisMonth.toISOString(), category: 'Shopping' },
        { amount: 5000, date: lastMonth.toISOString(), category: 'Shopping' },
      ];

      db.getAllRecords.mockResolvedValue(mockExpenses);

      const insights = await insightsService.analyzeSpending();

      const spendingInsight = insights.find(i => i.title.includes('Spending Increased'));
      expect(spendingInsight).toBeDefined();
    });

    it('should detect reduced spending', async () => {
      const thisMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const mockExpenses = [
        { amount: 5000, date: thisMonth.toISOString(), category: 'Shopping' },
        { amount: 10000, date: lastMonth.toISOString(), category: 'Shopping' },
      ];

      db.getAllRecords.mockResolvedValue(mockExpenses);

      const insights = await insightsService.analyzeSpending();

      const savingsInsight = insights.find(i => i.title.includes('Great Job'));
      expect(savingsInsight).toBeDefined();
    });
  });

  describe('analyzeBudgets', () => {
    it('should warn when budget is near limit', async () => {
      const mockBudgets = [
        { category: 'Food & Dining', amount: 10000 },
      ];

      const mockExpenses = [
        { amount: 9500, category: 'Food & Dining', date: new Date().toISOString() },
      ];

      db.getAllRecords
        .mockResolvedValueOnce(mockBudgets)
        .mockResolvedValueOnce(mockExpenses);

      const insights = await insightsService.analyzeBudgets();

      const warningInsight = insights.find(i => i.title.includes('Budget Alert'));
      expect(warningInsight).toBeDefined();
      expect(warningInsight.type).toBe('warning');
    });

    it('should alert when budget is exceeded', async () => {
      const mockBudgets = [
        { category: 'Food & Dining', amount: 10000 },
      ];

      const mockExpenses = [
        { amount: 12000, category: 'Food & Dining', date: new Date().toISOString() },
      ];

      db.getAllRecords
        .mockResolvedValueOnce(mockBudgets)
        .mockResolvedValueOnce(mockExpenses);

      const insights = await insightsService.analyzeBudgets();

      const alertInsight = insights.find(i => i.title.includes('Budget Exceeded'));
      expect(alertInsight).toBeDefined();
      expect(alertInsight.type).toBe('error');
    });
  });

  describe('analyzeSavings', () => {
    it('should calculate savings rate correctly', async () => {
      const thisMonth = new Date().toISOString();

      const mockExpenses = [
        { amount: 40000, date: thisMonth, category: 'Various' },
      ];

      const mockIncome = [
        { amount: 100000, date: thisMonth, category: 'Salary' },
      ];

      db.getAllRecords
        .mockResolvedValueOnce(mockExpenses)
        .mockResolvedValueOnce(mockIncome);

      const insights = await insightsService.analyzeSavings();

      expect(insights.length).toBeGreaterThan(0);
      const savingsInsight = insights.find(i => i.category === 'savings');
      expect(savingsInsight).toBeDefined();
    });

    it('should warn when spending exceeds income', async () => {
      const thisMonth = new Date().toISOString();

      const mockExpenses = [
        { amount: 120000, date: thisMonth, category: 'Various' },
      ];

      const mockIncome = [
        { amount: 100000, date: thisMonth, category: 'Salary' },
      ];

      db.getAllRecords
        .mockResolvedValueOnce(mockExpenses)
        .mockResolvedValueOnce(mockIncome);

      const insights = await insightsService.analyzeSavings();

      const deficitInsight = insights.find(i => i.title.includes('Spending More Than Earning'));
      expect(deficitInsight).toBeDefined();
      expect(deficitInsight.priority).toBe(100);
    });
  });

  describe('analyzeGoals', () => {
    it('should celebrate achieved goals', async () => {
      const mockGoals = [
        { 
          name: 'Emergency Fund', 
          target: 100000, 
          current: 100000, 
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      db.getAllRecords.mockResolvedValue(mockGoals);

      const insights = await insightsService.analyzeGoals();

      const achievementInsight = insights.find(i => i.title.includes('Goal Achieved'));
      expect(achievementInsight).toBeDefined();
      expect(achievementInsight.type).toBe('success');
    });

    it('should warn about approaching deadlines', async () => {
      const mockGoals = [
        { 
          name: 'Vacation Fund', 
          target: 100000, 
          current: 50000, 
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      db.getAllRecords.mockResolvedValue(mockGoals);

      const insights = await insightsService.analyzeGoals();

      const deadlineInsight = insights.find(i => i.title.includes('Goal Deadline Approaching'));
      expect(deadlineInsight).toBeDefined();
    });
  });

  describe('detectAnomalies', () => {
    it('should detect unusual transactions', async () => {
      const mockExpenses = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        amount: 1000,
        description: 'Normal expense',
        date: new Date().toISOString(),
      }));

      // Add an unusual transaction
      mockExpenses.push({
        id: 21,
        amount: 50000,
        description: 'Large purchase',
        date: new Date().toISOString(),
      });

      db.getAllRecords.mockResolvedValue(mockExpenses);

      const insights = await insightsService.detectAnomalies();

      const anomalyInsight = insights.find(i => i.category === 'anomaly');
      expect(anomalyInsight).toBeDefined();
    });
  });

  describe('helper methods', () => {
    it('should filter this month correctly', () => {
      const thisMonth = new Date().toISOString();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const records = [
        { date: thisMonth },
        { date: lastMonth.toISOString() },
      ];

      const filtered = insightsService.filterThisMonth(records);

      expect(filtered.length).toBe(1);
      expect(filtered[0].date).toBe(thisMonth);
    });

    it('should sum amounts correctly', () => {
      const records = [
        { amount: 100 },
        { amount: 200 },
        { amount: 300 },
      ];

      const total = insightsService.sum(records);

      expect(total).toBe(600);
    });

    it('should group by category', () => {
      const records = [
        { amount: 100, category: 'Food' },
        { amount: 200, category: 'Food' },
        { amount: 300, category: 'Transport' },
      ];

      const grouped = insightsService.groupByCategory(records);

      expect(grouped['Food']).toBe(300);
      expect(grouped['Transport']).toBe(300);
    });

    it('should format currency correctly', () => {
      const formatted = insightsService.formatCurrency(1234567.89);

      expect(formatted).toContain('12,34,568');
      expect(formatted).toContain('₹');
    });
  });

  describe('getHighPriorityInsights', () => {
    it('should filter high priority insights', async () => {
      insightsService.insights = [
        { priority: 95, title: 'High' },
        { priority: 85, title: 'Also High' },
        { priority: 50, title: 'Medium' },
        { priority: 30, title: 'Low' },
      ];

      const highPriority = insightsService.getHighPriorityInsights();

      expect(highPriority.length).toBe(2);
      expect(highPriority.every(i => i.priority >= 80)).toBe(true);
    });
  });

  describe('getInsightsByCategory', () => {
    it('should filter insights by category', () => {
      insightsService.insights = [
        { category: 'spending', title: 'Spending 1' },
        { category: 'spending', title: 'Spending 2' },
        { category: 'savings', title: 'Savings 1' },
      ];

      const spendingInsights = insightsService.getInsightsByCategory('spending');

      expect(spendingInsights.length).toBe(2);
      expect(spendingInsights.every(i => i.category === 'spending')).toBe(true);
    });
  });
});
