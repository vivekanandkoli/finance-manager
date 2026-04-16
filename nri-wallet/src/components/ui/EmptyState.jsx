import React from 'react';
import { Inbox, FileText, TrendingUp, Calendar, PiggyBank } from 'lucide-react';

/**
 * Empty State Component for better UX when no data is available
 */
export const EmptyState = React.memo(({
  icon: Icon = Inbox,
  title = 'No data available',
  description = 'Get started by adding your first item',
  action,
  actionLabel = 'Add Item',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icon className="text-gray-400" size={48} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// Predefined empty states for common scenarios
export const NoExpenses = React.memo(({ onAdd }) => (
  <EmptyState
    icon={FileText}
    title="No expenses yet"
    description="Start tracking your expenses to get insights into your spending habits"
    action={onAdd}
    actionLabel="Add Expense"
  />
));

NoExpenses.displayName = 'NoExpenses';

export const NoBudgets = React.memo(({ onAdd }) => (
  <EmptyState
    icon={PiggyBank}
    title="No budgets set"
    description="Create budgets to manage your spending and reach your financial goals"
    action={onAdd}
    actionLabel="Create Budget"
  />
));

NoBudgets.displayName = 'NoBudgets';

export const NoBills = React.memo(({ onAdd }) => (
  <EmptyState
    icon={Calendar}
    title="No bills added"
    description="Add your bills to get reminders and never miss a payment"
    action={onAdd}
    actionLabel="Add Bill"
  />
));

NoBills.displayName = 'NoBills';

export const NoInvestments = React.memo(({ onAdd }) => (
  <EmptyState
    icon={TrendingUp}
    title="No investments tracked"
    description="Start tracking your investments to monitor your portfolio performance"
    action={onAdd}
    actionLabel="Add Investment"
  />
));

NoInvestments.displayName = 'NoInvestments';

export const NoSearchResults = React.memo(() => (
  <EmptyState
    icon={Inbox}
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for"
  />
));

NoSearchResults.displayName = 'NoSearchResults';

export default EmptyState;
