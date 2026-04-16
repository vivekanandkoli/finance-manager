import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { initDB } from './db';
import Sidebar from './components/Sidebar';
import { LoadingSpinner } from './components/ui';
import './App.css';

// Lazy load components for better initial performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const ExpenseForm = lazy(() => import('./components/ExpenseForm'));
const ExpenseList = lazy(() => import('./components/ExpenseList'));
const InvestmentPortfolio = lazy(() => import('./components/InvestmentPortfolio'));
const LoanTracker = lazy(() => import('./components/LoanTracker'));
const CurrencyConverter = lazy(() => import('./components/CurrencyConverter'));
const GoalTracker = lazy(() => import('./components/GoalTracker'));
const BudgetManager = lazy(() => import('./components/BudgetManager'));
const Analytics = lazy(() => import('./components/Analytics'));
const DataImport = lazy(() => import('./components/DataImport'));
const WealthReport = lazy(() => import('./components/WealthReport'));
const DataManager = lazy(() => import('./components/DataManager'));
const BillReminders = lazy(() => import('./components/BillReminders'));
const AccountsManager = lazy(() => import('./components/AccountsManager'));
const IncomeManager = lazy(() => import('./components/IncomeManager'));
const DepositsManager = lazy(() => import('./components/DepositsManager'));
const BankStatementUploader = lazy(() => import('./components/BankStatementUploader'));

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    initDB().catch(err => {
      console.error('Failed to initialize database:', err);
      alert('Database initialization failed. Please refresh the page.');
    });
  }, []);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="App">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        
        <main className="main-content">
          <Suspense fallback={
            <LoadingSpinner 
              fullScreen 
              message={`Loading ${currentView}...`} 
            />
          }>
            {currentView === 'dashboard' && <Dashboard key={refreshTrigger} />}
            {currentView === 'add expense' && <ExpenseForm onExpenseAdded={handleExpenseAdded} />}
            {currentView === 'expense history' && <ExpenseList refreshTrigger={refreshTrigger} />}
            {currentView === 'investments' && <InvestmentPortfolio />}
            {currentView === 'loans' && <LoanTracker />}
            {currentView === 'currency' && <CurrencyConverter />}
            {currentView === 'goals' && <GoalTracker />}
            {currentView === 'budgets' && <BudgetManager />}
            {currentView === 'bills' && <BillReminders />}
            {currentView === 'analytics' && <Analytics />}
            {currentView === 'wealth report' && <WealthReport />}
            {currentView === 'accounts' && <AccountsManager />}
            {currentView === 'income' && <IncomeManager />}
            {currentView === 'deposits' && <DepositsManager />}
            {currentView === 'bank statements' && <BankStatementUploader onComplete={(results) => {
              console.log('Bank statements processed:', results);
              // Phase 2: Parse transactions from results
            }} />}
            {currentView === 'import/export' && <DataImport />}
            {currentView === 'edit data' && <DataManager />}
          </Suspense>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
