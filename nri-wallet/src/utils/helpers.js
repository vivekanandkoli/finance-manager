/**
 * Format currency with Indian locale
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const num = parseFloat(amount) || 0;
  
  if (currency === 'INR' || currency === '₹') {
    return `₹${num.toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  }
  
  return `${currency} ${num.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (num) => {
  const number = parseFloat(num) || 0;
  
  if (number >= 1e9) return `₹${(number / 1e9).toFixed(1)}B`;
  if (number >= 1e6) return `₹${(number / 1e6).toFixed(1)}M`;
  if (number >= 1e5) return `₹${(number / 1e5).toFixed(1)}L`;
  if (number >= 1e3) return `₹${(number / 1e3).toFixed(1)}K`;
  
  return formatCurrency(number);
};

/**
 * Get status badge color classes
 */
export const getStatusColor = (status) => {
  const statusColors = {
    unsubmitted: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200'
    },
    submitted: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    approved: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    reimbursed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200'
    },
    draft: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200'
    }
  };
  
  return statusColors[status] || statusColors.draft;
};

/**
 * Validate expense form data
 */
export const validateExpense = (expense) => {
  const errors = {};
  
  if (!expense.description || expense.description.trim() === '') {
    errors.description = 'Description is required';
  }
  
  if (!expense.amount || parseFloat(expense.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  if (!expense.category || expense.category === '') {
    errors.category = 'Category is required';
  }
  
  if (!expense.date) {
    errors.date = 'Date is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Group expenses by category
 */
export const groupByCategory = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        category,
        total: 0,
        count: 0,
        expenses: []
      };
    }
    acc[category].total += parseFloat(expense.amount || 0);
    acc[category].count += 1;
    acc[category].expenses.push(expense);
    return acc;
  }, {});
};

/**
 * Group expenses by status
 */
export const groupByStatus = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const status = expense.status || 'unsubmitted';
    if (!acc[status]) {
      acc[status] = {
        status,
        total: 0,
        count: 0,
        expenses: []
      };
    }
    acc[status].total += parseFloat(expense.amount || 0);
    acc[status].count += 1;
    acc[status].expenses.push(expense);
    return acc;
  }, {});
};

/**
 * Filter expenses by date range
 */
export const filterByDateRange = (expenses, startDate, endDate) => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenseDate >= start && expenseDate <= end;
  });
};

/**
 * Get color for chart based on index
 */
export const getChartColor = (index) => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];
  return colors[index % colors.length];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Check if date is within current month
 */
export const isCurrentMonth = (date) => {
  const now = new Date();
  const checkDate = new Date(date);
  return checkDate.getMonth() === now.getMonth() && 
         checkDate.getFullYear() === now.getFullYear();
};

/**
 * Check if date is within current year
 */
export const isCurrentYear = (date) => {
  const now = new Date();
  const checkDate = new Date(date);
  return checkDate.getFullYear() === now.getFullYear();
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

/**
 * Sort array by multiple fields
 */
export const multiSort = (array, sortBy) => {
  return array.sort((a, b) => {
    for (const sort of sortBy) {
      const { field, order = 'asc' } = sort;
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};
