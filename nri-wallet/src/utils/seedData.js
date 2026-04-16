import { addRecord } from '../db';

// Expense Categories
const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Rent',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Insurance',
  'EMI/Loan',
  'Other'
];

const _currencies = ['INR', 'THB'];

// Income Sources
const _incomeSources = [
  'Salary',
  'Freelance',
  'Dividends',
  'Interest',
  'Rental Income',
  'Business Income',
  'Bonus',
  'Gift'
];

// Investment Types
const _investmentTypes = [
  'Equity',
  'Debt',
  'Hybrid',
  'Gold',
  'Real Estate',
  'Fixed Deposit'
];

// Seed comprehensive financial data
export const seedComprehensiveData = async () => {
  try {
    let totalAdded = 0;

    // 1. Seed Income (Last 6 months)
    console.log('📥 Seeding income data...');
    for (let month = 5; month >= 0; month--) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      date.setDate(1); // First day of month

      // Primary Salary
      await addRecord('income', {
        source: 'Salary',
        amount: 150000 + Math.random() * 50000, // 1.5L - 2L
        date: date.toISOString(),
        currency: 'INR',
        description: 'Monthly Salary',
        category: 'Employment',
        recurring: true
      });

      // Occasional freelance or dividends
      if (Math.random() > 0.5) {
        await addRecord('income', {
          source: Math.random() > 0.5 ? 'Freelance' : 'Dividends',
          amount: 10000 + Math.random() * 30000,
          date: new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          currency: 'INR',
          description: Math.random() > 0.5 ? 'Freelance Project' : 'Mutual Fund Dividends',
          category: Math.random() > 0.5 ? 'Freelance' : 'Investment',
          recurring: false
        });
      }

      totalAdded += 2;
    }
    console.log('✅ Income data seeded');

    // 2. Seed Expenses (Last 6 months, varying amounts)
    console.log('💸 Seeding expense data...');
    for (let i = 0; i < 100; i++) {
      const randomDays = Math.floor(Math.random() * 180); // Last 6 months
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() - randomDays);

      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const currency = Math.random() > 0.3 ? 'INR' : 'THB';
      
      let amount;
      if (category === 'Rent') {
        amount = 25000 + Math.random() * 10000; // 25-35k
      } else if (category === 'Food & Dining') {
        amount = 200 + Math.random() * 1500; // 200-1700
      } else if (category === 'Transportation') {
        amount = 50 + Math.random() * 2000; // 50-2000
      } else if (category === 'Shopping') {
        amount = 500 + Math.random() * 5000; // 500-5500
      } else if (category === 'Entertainment') {
        amount = 300 + Math.random() * 2000; // 300-2300
      } else {
        amount = 100 + Math.random() * 3000; // 100-3100
      }

      if (currency === 'THB') {
        amount *= 2.5; // Convert to THB (1 INR ≈ 2.5 THB)
      }

      await addRecord('expenses', {
        description: `${category} expense`,
        amount: parseFloat(amount.toFixed(2)),
        category: category,
        date: expenseDate.toISOString().split('T')[0],
        currency: currency,
        paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'Debit Card',
        notes: ''
      });

      totalAdded++;
    }
    console.log('✅ Expense data seeded');

    // 3. Seed Investments (Portfolio)
    console.log('📈 Seeding investment data...');
    const investments = [
      {
        fundName: 'ICICI Prudential Bluechip Fund',
        category: 'Equity',
        investmentDate: '2023-01-15',
        investedAmount: 500000,
        currentValue: 625000,
        units: 12500,
        currentNAV: 50,
        returns: 25.0
      },
      {
        fundName: 'HDFC Balanced Advantage Fund',
        category: 'Hybrid',
        investmentDate: '2023-06-10',
        investedAmount: 300000,
        currentValue: 345000,
        units: 8500,
        currentNAV: 40.59,
        returns: 15.0
      },
      {
        fundName: 'SBI Gold Fund',
        category: 'Gold',
        investmentDate: '2024-01-20',
        investedAmount: 200000,
        currentValue: 218000,
        units: 5000,
        currentNAV: 43.6,
        returns: 9.0
      },
      {
        fundName: 'Axis Treasury Advantage Fund',
        category: 'Debt',
        investmentDate: '2023-03-05',
        investedAmount: 400000,
        currentValue: 436000,
        units: 18000,
        currentNAV: 24.22,
        returns: 9.0
      },
      {
        fundName: 'Kotak Emerging Equity Fund',
        category: 'Equity',
        investmentDate: '2022-11-10',
        investedAmount: 350000,
        currentValue: 469000,
        units: 9500,
        currentNAV: 49.37,
        returns: 34.0
      }
    ];

    for (const inv of investments) {
      await addRecord('investments', inv);
      totalAdded++;
    }
    console.log('✅ Investment data seeded');

    // 4. Seed Loans
    console.log('🏦 Seeding loan data...');
    const loans = [
      {
        loanType: 'Home Loan',
        loanProvider: 'HDFC Bank',
        principalAmount: 5000000,
        interestRate: 8.5,
        tenure: 240, // 20 years
        startDate: '2020-04-01',
        monthlyEMI: 43391,
        currentOutstanding: 4250000,
        paidEMIs: 48,
        remainingEMIs: 192,
        status: 'Active'
      },
      {
        loanType: 'Car Loan',
        loanProvider: 'ICICI Bank',
        principalAmount: 800000,
        interestRate: 9.5,
        tenure: 60, // 5 years
        startDate: '2022-06-01',
        monthlyEMI: 16724,
        currentOutstanding: 485000,
        paidEMIs: 22,
        remainingEMIs: 38,
        status: 'Active'
      }
    ];

    for (const loan of loans) {
      await addRecord('loans', loan);
      totalAdded++;
    }
    console.log('✅ Loan data seeded');

    // 5. Seed Goals
    console.log('🎯 Seeding goal data...');
    const goals = [
      {
        name: 'Emergency Fund',
        category: 'Safety',
        targetAmount: 500000,
        currentAmount: 325000,
        targetDate: '2024-12-31',
        priority: 'High',
        status: 'In Progress',
        monthlyContribution: 25000
      },
      {
        name: 'Dream Vacation - Europe',
        category: 'Lifestyle',
        targetAmount: 400000,
        currentAmount: 180000,
        targetDate: '2025-06-30',
        priority: 'Medium',
        status: 'In Progress',
        monthlyContribution: 15000
      },
      {
        name: 'Child Education Fund',
        category: 'Education',
        targetAmount: 2000000,
        currentAmount: 450000,
        targetDate: '2030-06-30',
        priority: 'High',
        status: 'In Progress',
        monthlyContribution: 20000
      },
      {
        name: 'Retirement Corpus',
        category: 'Retirement',
        targetAmount: 20000000,
        currentAmount: 2500000,
        targetDate: '2045-12-31',
        priority: 'High',
        status: 'In Progress',
        monthlyContribution: 30000
      }
    ];

    for (const goal of goals) {
      await addRecord('goals', goal);
      totalAdded++;
    }
    console.log('✅ Goal data seeded');

    // 6. Seed Budgets
    console.log('💰 Seeding budget data...');
    const currentDate = new Date();
    const budgets = [
      { category: 'Food & Dining', amount: 15000, period: 'monthly', startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString() },
      { category: 'Transportation', amount: 5000, period: 'monthly', startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString() },
      { category: 'Shopping', amount: 8000, period: 'monthly', startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString() },
      { category: 'Entertainment', amount: 6000, period: 'monthly', startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString() },
      { category: 'Utilities', amount: 4000, period: 'monthly', startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString() },
      { category: 'Healthcare', amount: 3000, period: 'monthly', startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString() }
    ];

    for (const budget of budgets) {
      await addRecord('budgets', budget);
      totalAdded++;
    }
    console.log('✅ Budget data seeded');

    // 7. Seed Bill Reminders
    console.log('📅 Seeding bill reminders...');
    const today = new Date();
    const bills = [
      {
        billName: 'Electricity Bill',
        amount: 3500,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0],
        category: 'Utilities',
        recurringType: 'monthly',
        isPaid: false,
        notes: 'TATA Power'
      },
      {
        billName: 'Internet & Broadband',
        amount: 1299,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0],
        category: 'Utilities',
        recurringType: 'monthly',
        isPaid: false,
        notes: 'Airtel Fiber'
      },
      {
        billName: 'Mobile Bill',
        amount: 599,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0],
        category: 'Utilities',
        recurringType: 'monthly',
        isPaid: true,
        paidDate: new Date(today.getFullYear(), today.getMonth(), 4).toISOString(),
        notes: 'Jio Postpaid'
      },
      {
        billName: 'Credit Card Bill',
        amount: 15840,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0],
        category: 'Other',
        recurringType: 'monthly',
        isPaid: false,
        notes: 'HDFC Regalia'
      },
      {
        billName: 'Home Insurance Premium',
        amount: 12000,
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0],
        category: 'Insurance',
        recurringType: 'yearly',
        isPaid: false,
        notes: 'ICICI Lombard'
      }
    ];

    for (const bill of bills) {
      await addRecord('billReminders', bill);
      totalAdded++;
    }
    console.log('✅ Bill reminders seeded');

    // 8. Seed Recurring Transactions
    console.log('🔄 Seeding recurring transactions...');
    const recurring = [
      {
        name: 'Netflix Subscription',
        amount: 649,
        category: 'Subscription',
        frequency: 'monthly',
        startDate: '2023-01-15',
        nextDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0],
        isActive: true,
        autoGenerate: true
      },
      {
        name: 'Spotify Premium',
        amount: 119,
        category: 'Subscription',
        frequency: 'monthly',
        startDate: '2023-02-10',
        nextDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0],
        isActive: true,
        autoGenerate: true
      },
      {
        name: 'Gym Membership',
        amount: 2500,
        category: 'Healthcare',
        frequency: 'monthly',
        startDate: '2023-01-01',
        nextDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        isActive: true,
        autoGenerate: true
      },
      {
        name: 'Amazon Prime',
        amount: 1499,
        category: 'Subscription',
        frequency: 'yearly',
        startDate: '2023-06-15',
        nextDate: '2024-06-15',
        isActive: true,
        autoGenerate: true
      },
      {
        name: 'Cloud Storage (Google One)',
        amount: 650,
        category: 'Subscription',
        frequency: 'monthly',
        startDate: '2023-03-01',
        nextDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        isActive: true,
        autoGenerate: true
      },
      {
        name: 'Newspaper Subscription',
        amount: 300,
        category: 'Other',
        frequency: 'monthly',
        startDate: '2023-01-01',
        nextDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        isActive: true,
        autoGenerate: true
      }
    ];

    for (const rec of recurring) {
      await addRecord('recurringTransactions', rec);
      totalAdded++;
    }
    console.log('✅ Recurring transactions seeded');

    console.log(`\n🎉 SUCCESS! Seeded ${totalAdded} records across all categories`);
    
    return {
      success: true,
      message: `Generated comprehensive financial data`,
      totalRecords: totalAdded,
      breakdown: {
        income: 12,
        expenses: 100,
        investments: 5,
        loans: 2,
        goals: 4,
        budgets: 6,
        bills: 5,
        recurring: 6
      }
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Clear all data
export const clearAllData = async () => {
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('NRIWalletDB');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const stores = ['expenses', 'income', 'investments', 'loans', 'goals', 'budgets', 'billReminders', 'recurringTransactions'];
    
    for (const storeName of stores) {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
      console.log(`✅ Cleared ${storeName}`);
    }
    
    console.log('✅ All data cleared');
    
    return {
      success: true,
      message: 'All data cleared successfully'
    };
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
};

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  window.seedComprehensiveData = seedComprehensiveData;
  window.clearAllData = clearAllData;
}

export default { seedComprehensiveData, clearAllData };
