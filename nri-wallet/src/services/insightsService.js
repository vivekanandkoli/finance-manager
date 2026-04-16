import { getAllRecords } from '../db';
import { format, startOfMonth, endOfMonth, subMonths, isWeekend } from 'date-fns';

/**
 * Smart Insights Service
 * Generates actionable financial insights and notifications
 */

class InsightsService {
  constructor() {
    this.insights = [];
    this.notificationQueue = [];
  }

  /**
   * Generate all insights
   * @returns {Promise<Array>} Array of insight objects
   */
  async generateInsights() {
    console.log('🔍 Generating smart insights...');
    
    this.insights = [];
    
    try {
      // Parallel insight generation
      const [
        spendingInsights,
        budgetInsights,
        savingsInsights,
        patternInsights,
        goalInsights,
        investmentInsights,
        anomalyInsights,
      ] = await Promise.all([
        this.analyzeSpending(),
        this.analyzeBudgets(),
        this.analyzeSavings(),
        this.analyzePatterns(),
        this.analyzeGoals(),
        this.analyzeInvestments(),
        this.detectAnomalies(),
      ]);

      this.insights = [
        ...spendingInsights,
        ...budgetInsights,
        ...savingsInsights,
        ...patternInsights,
        ...goalInsights,
        ...investmentInsights,
        ...anomalyInsights,
      ].sort((a, b) => b.priority - a.priority);

      console.log(`✅ Generated ${this.insights.length} insights`);
      return this.insights;
      
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  /**
   * Analyze spending patterns
   */
  async analyzeSpending() {
    const insights = [];
    const expenses = await getAllRecords('expenses');
    
    if (expenses.length === 0) return insights;

    const thisMonth = this.filterThisMonth(expenses);
    const lastMonth = this.filterLastMonth(expenses);
    
    // Month-over-month comparison
    const thisMonthTotal = this.sum(thisMonth);
    const lastMonthTotal = this.sum(lastMonth);
    
    if (lastMonthTotal > 0) {
      const change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      
      if (change > 20) {
        insights.push({
          type: 'warning',
          category: 'spending',
          title: '⚠️ Spending Increased',
          message: `You've spent ${change.toFixed(0)}% more this month (${this.formatCurrency(thisMonthTotal)}) vs last month (${this.formatCurrency(lastMonthTotal)})`,
          priority: 90,
          action: 'Review expenses',
          data: { change, thisMonth: thisMonthTotal, lastMonth: lastMonthTotal },
        });
      } else if (change < -20) {
        insights.push({
          type: 'success',
          category: 'spending',
          title: '🎉 Great Job!',
          message: `You've reduced spending by ${Math.abs(change).toFixed(0)}% this month!`,
          priority: 70,
          action: 'Keep it up',
          data: { change, thisMonth: thisMonthTotal, lastMonth: lastMonthTotal },
        });
      }
    }

    // Category-wise analysis
    const categoryTotals = this.groupByCategory(thisMonth);
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory) {
      const [category, amount] = topCategory;
      const percentage = (amount / thisMonthTotal) * 100;
      
      if (percentage > 30) {
        insights.push({
          type: 'info',
          category: 'spending',
          title: `💰 Top Spending: ${category}`,
          message: `${percentage.toFixed(0)}% of your spending (${this.formatCurrency(amount)}) is on ${category}`,
          priority: 60,
          action: 'Optimize spending',
          data: { category, amount, percentage },
        });
      }
    }

    // Weekend spending analysis
    const weekendExpenses = thisMonth.filter(e => {
      const date = new Date(e.date);
      return isWeekend(date);
    });
    
    const weekendTotal = this.sum(weekendExpenses);
    const weekendPercentage = (weekendTotal / thisMonthTotal) * 100;
    
    if (weekendPercentage > 40) {
      insights.push({
        type: 'info',
        category: 'patterns',
        title: '📅 Weekend Spending Alert',
        message: `${weekendPercentage.toFixed(0)}% of your spending happens on weekends`,
        priority: 50,
        action: 'Plan weekend budget',
        data: { weekendTotal, weekendPercentage },
      });
    }

    return insights;
  }

  /**
   * Analyze budget adherence
   */
  async analyzeBudgets() {
    const insights = [];
    const budgets = await getAllRecords('budgets');
    const expenses = await getAllRecords('expenses');
    
    if (budgets.length === 0) return insights;

    const thisMonth = this.filterThisMonth(expenses);
    
    budgets.forEach(budget => {
      const categoryExpenses = thisMonth.filter(e => e.category === budget.category);
      const spent = this.sum(categoryExpenses);
      const percentage = (spent / budget.amount) * 100;
      
      if (percentage >= 90 && percentage < 100) {
        insights.push({
          type: 'warning',
          category: 'budget',
          title: `⚠️ Budget Alert: ${budget.category}`,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget (${this.formatCurrency(spent)} / ${this.formatCurrency(budget.amount)})`,
          priority: 85,
          action: 'Slow down spending',
          data: { budget: budget.category, spent, limit: budget.amount, percentage },
        });
      } else if (percentage >= 100) {
        insights.push({
          type: 'error',
          category: 'budget',
          title: `🚨 Budget Exceeded: ${budget.category}`,
          message: `You've exceeded your ${budget.category} budget by ${this.formatCurrency(spent - budget.amount)}`,
          priority: 95,
          action: 'Stop non-essential spending',
          data: { budget: budget.category, spent, limit: budget.amount, overage: spent - budget.amount },
        });
      } else if (percentage < 50) {
        insights.push({
          type: 'success',
          category: 'budget',
          title: `✅ On Track: ${budget.category}`,
          message: `Great! You've only used ${percentage.toFixed(0)}% of your ${budget.category} budget`,
          priority: 40,
          action: 'Keep managing well',
          data: { budget: budget.category, spent, limit: budget.amount, percentage },
        });
      }
    });

    return insights;
  }

  /**
   * Analyze savings potential
   */
  async analyzeSavings() {
    const insights = [];
    const expenses = await getAllRecords('expenses');
    const income = await getAllRecords('income');
    
    const thisMonth = this.filterThisMonth(expenses);
    const thisMonthIncome = this.filterThisMonth(income);
    
    const totalExpenses = this.sum(thisMonth);
    const totalIncome = this.sum(thisMonthIncome);
    
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      
      if (savingsRate < 0) {
        insights.push({
          type: 'error',
          category: 'savings',
          title: '🚨 Spending More Than Earning',
          message: `You're ${this.formatCurrency(Math.abs(totalIncome - totalExpenses))} in deficit this month`,
          priority: 100,
          action: 'Urgent: Cut expenses',
          data: { income: totalIncome, expenses: totalExpenses, deficit: totalExpenses - totalIncome },
        });
      } else if (savingsRate < 20) {
        insights.push({
          type: 'warning',
          category: 'savings',
          title: '⚠️ Low Savings Rate',
          message: `You're saving only ${savingsRate.toFixed(0)}%. Aim for at least 20%`,
          priority: 80,
          action: 'Increase savings',
          data: { savingsRate, income: totalIncome, expenses: totalExpenses },
        });
      } else if (savingsRate >= 30) {
        insights.push({
          type: 'success',
          category: 'savings',
          title: '🎉 Excellent Savings!',
          message: `You're saving ${savingsRate.toFixed(0)}% of your income. Outstanding!`,
          priority: 70,
          action: 'Consider investing surplus',
          data: { savingsRate, income: totalIncome, expenses: totalExpenses },
        });
      }
    }

    // Subscription optimization
    const subscriptions = thisMonth.filter(e => 
      e.recurring || 
      ['Netflix', 'Spotify', 'Prime', 'Gym'].some(s => 
        e.description.toLowerCase().includes(s.toLowerCase())
      )
    );
    
    if (subscriptions.length > 0) {
      const subscriptionTotal = this.sum(subscriptions);
      insights.push({
        type: 'info',
        category: 'savings',
        title: '💡 Subscription Review',
        message: `You're spending ${this.formatCurrency(subscriptionTotal)}/month on ${subscriptions.length} subscriptions. Review for unused ones.`,
        priority: 55,
        action: 'Review subscriptions',
        data: { subscriptions: subscriptions.length, total: subscriptionTotal },
      });
    }

    return insights;
  }

  /**
   * Detect spending patterns
   */
  async analyzePatterns() {
    const insights = [];
    const expenses = await getAllRecords('expenses');
    
    if (expenses.length < 30) return insights;

    // Time-of-day pattern
    const eveningExpenses = expenses.filter(e => {
      const hour = new Date(e.timestamp || e.date).getHours();
      return hour >= 18 && hour <= 23;
    });
    
    const eveningPercentage = (eveningExpenses.length / expenses.length) * 100;
    
    if (eveningPercentage > 60) {
      insights.push({
        type: 'info',
        category: 'patterns',
        title: '🌙 Evening Spending Pattern',
        message: `${eveningPercentage.toFixed(0)}% of your expenses occur in the evening. Consider planning ahead.`,
        priority: 45,
        action: 'Plan daily budget',
        data: { eveningPercentage },
      });
    }

    // Recurring expense detection
    const descriptions = expenses.map(e => e.description.toLowerCase());
    const duplicates = descriptions.filter((d, i) => descriptions.indexOf(d) !== i);
    
    if (duplicates.length > 5) {
      insights.push({
        type: 'info',
        category: 'patterns',
        title: '🔄 Recurring Expenses Found',
        message: `Found ${duplicates.length} potential recurring expenses. Set up auto-tracking?`,
        priority: 50,
        action: 'Setup recurring tracking',
        data: { count: duplicates.length },
      });
    }

    return insights;
  }

  /**
   * Analyze goal progress
   */
  async analyzeGoals() {
    const insights = [];
    const goals = await getAllRecords('goals');
    
    goals.forEach(goal => {
      const percentage = (goal.current / goal.target) * 100;
      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 30 && percentage < 80) {
        insights.push({
          type: 'warning',
          category: 'goals',
          title: `⏰ Goal Deadline Approaching: ${goal.name}`,
          message: `Only ${daysLeft} days left and you're at ${percentage.toFixed(0)}%. Increase savings by ${this.formatCurrency((goal.target - goal.current) / daysLeft)}/day`,
          priority: 85,
          action: 'Increase contributions',
          data: { goal: goal.name, percentage, daysLeft, required: (goal.target - goal.current) / daysLeft },
        });
      } else if (percentage >= 100) {
        insights.push({
          type: 'success',
          category: 'goals',
          title: `🎯 Goal Achieved: ${goal.name}`,
          message: `Congratulations! You've reached your ${goal.name} goal!`,
          priority: 95,
          action: 'Celebrate and set new goal',
          data: { goal: goal.name },
        });
      } else if (percentage >= 75) {
        insights.push({
          type: 'success',
          category: 'goals',
          title: `🚀 Almost There: ${goal.name}`,
          message: `You're ${percentage.toFixed(0)}% toward your ${goal.name} goal. Keep going!`,
          priority: 65,
          action: 'Stay on track',
          data: { goal: goal.name, percentage },
        });
      }
    });

    return insights;
  }

  /**
   * Analyze investment portfolio
   */
  async analyzeInvestments() {
    const insights = [];
    const investments = await getAllRecords('investments');
    
    if (investments.length === 0) return insights;

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue || inv.amount), 0);
    
    const returns = ((totalCurrent - totalInvested) / totalInvested) * 100;
    
    if (returns > 15) {
      insights.push({
        type: 'success',
        category: 'investments',
        title: '📈 Portfolio Performing Well',
        message: `Your investments are up ${returns.toFixed(1)}%! Current value: ${this.formatCurrency(totalCurrent)}`,
        priority: 70,
        action: 'Consider rebalancing',
        data: { returns, invested: totalInvested, current: totalCurrent },
      });
    } else if (returns < -10) {
      insights.push({
        type: 'warning',
        category: 'investments',
        title: '📉 Portfolio Review Needed',
        message: `Your investments are down ${Math.abs(returns).toFixed(1)}%. Review your strategy.`,
        priority: 75,
        action: 'Review portfolio',
        data: { returns, invested: totalInvested, current: totalCurrent },
      });
    }

    // Diversification check
    const categories = [...new Set(investments.map(i => i.type))];
    if (categories.length < 3) {
      insights.push({
        type: 'info',
        category: 'investments',
        title: '🎯 Diversification Opportunity',
        message: `Your portfolio has only ${categories.length} asset type(s). Consider diversifying.`,
        priority: 60,
        action: 'Diversify portfolio',
        data: { categories: categories.length },
      });
    }

    return insights;
  }

  /**
   * Detect anomalies and unusual transactions
   */
  async detectAnomalies() {
    const insights = [];
    const expenses = await getAllRecords('expenses');
    
    if (expenses.length < 10) return insights;

    const amounts = expenses.map(e => parseFloat(e.amount));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length);
    
    const recentExpenses = expenses.slice(-10);
    
    recentExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      const zScore = Math.abs((amount - mean) / stdDev);
      
      if (zScore > 2.5) {
        insights.push({
          type: 'info',
          category: 'anomaly',
          title: '🔍 Unusual Transaction Detected',
          message: `${this.formatCurrency(amount)} spent on ${expense.description} is ${zScore.toFixed(1)}x your average. Is this correct?`,
          priority: 70,
          action: 'Verify transaction',
          data: { amount, description: expense.description, zScore },
        });
      }
    });

    return insights;
  }

  /**
   * Helper methods
   */
  filterThisMonth(records) {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    return records.filter(r => {
      const date = new Date(r.date);
      return date >= start && date <= end;
    });
  }

  filterLastMonth(records) {
    const lastMonth = subMonths(new Date(), 1);
    const start = startOfMonth(lastMonth);
    const end = endOfMonth(lastMonth);
    
    return records.filter(r => {
      const date = new Date(r.date);
      return date >= start && date <= end;
    });
  }

  sum(records) {
    return records.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  }

  groupByCategory(records) {
    return records.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + parseFloat(r.amount || 0);
      return acc;
    }, {});
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Get insights by category
   */
  getInsightsByCategory(category) {
    return this.insights.filter(i => i.category === category);
  }

  /**
   * Get high priority insights (for notifications)
   */
  getHighPriorityInsights() {
    return this.insights.filter(i => i.priority >= 80);
  }

  /**
   * Mark insight as read
   */
  markAsRead(insightId) {
    const insight = this.insights.find(i => i.id === insightId);
    if (insight) {
      insight.read = true;
    }
  }

  /**
   * Clear all insights
   */
  clearInsights() {
    this.insights = [];
  }
}

// Singleton instance
export const insightsService = new InsightsService();
