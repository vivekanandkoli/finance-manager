// IndexedDB wrapper for NRI Wallet
const DB_NAME = 'NRIWalletDB';
const DB_VERSION = 3; // Updated to support accounts and deposits

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // Expenses store
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
        expenseStore.createIndex('date', 'date', { unique: false });
        expenseStore.createIndex('category', 'category', { unique: false });
        expenseStore.createIndex('currency', 'currency', { unique: false });
      }

      // Goals store
      if (!db.objectStoreNames.contains('goals')) {
        const goalStore = db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
        goalStore.createIndex('name', 'name', { unique: false });
        goalStore.createIndex('category', 'category', { unique: false });
        goalStore.createIndex('targetDate', 'targetDate', { unique: false });
      }

      // Budgets store
      if (!db.objectStoreNames.contains('budgets')) {
        const budgetStore = db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
        budgetStore.createIndex('category', 'category', { unique: false });
        budgetStore.createIndex('startDate', 'startDate', { unique: false });
      }

      // Income store
      if (!db.objectStoreNames.contains('income')) {
        const incomeStore = db.createObjectStore('income', { keyPath: 'id', autoIncrement: true });
        incomeStore.createIndex('date', 'date', { unique: false });
        incomeStore.createIndex('source', 'source', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Investments store (Mutual Funds)
      if (!db.objectStoreNames.contains('investments')) {
        const investmentStore = db.createObjectStore('investments', { keyPath: 'id', autoIncrement: true });
        investmentStore.createIndex('fundName', 'fundName', { unique: false });
        investmentStore.createIndex('category', 'category', { unique: false });
        investmentStore.createIndex('investmentDate', 'investmentDate', { unique: false });
      }

      // Loans store
      if (!db.objectStoreNames.contains('loans')) {
        const loanStore = db.createObjectStore('loans', { keyPath: 'id', autoIncrement: true });
        loanStore.createIndex('loanType', 'loanType', { unique: false });
        loanStore.createIndex('startDate', 'startDate', { unique: false });
      }

      // Currency Exchange Rates store
      if (!db.objectStoreNames.contains('exchangeRates')) {
        const ratesStore = db.createObjectStore('exchangeRates', { keyPath: 'id', autoIncrement: true });
        ratesStore.createIndex('date', 'date', { unique: false });
      }

      // Recurring Transactions store
      if (!db.objectStoreNames.contains('recurringTransactions')) {
        const recurringStore = db.createObjectStore('recurringTransactions', { keyPath: 'id', autoIncrement: true });
        recurringStore.createIndex('name', 'name', { unique: false });
        recurringStore.createIndex('frequency', 'frequency', { unique: false });
        recurringStore.createIndex('nextDate', 'nextDate', { unique: false });
        recurringStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Bill Reminders store
      if (!db.objectStoreNames.contains('billReminders')) {
        const billStore = db.createObjectStore('billReminders', { keyPath: 'id', autoIncrement: true });
        billStore.createIndex('billName', 'billName', { unique: false });
        billStore.createIndex('dueDate', 'dueDate', { unique: false });
        billStore.createIndex('status', 'status', { unique: false });
        billStore.createIndex('isPaid', 'isPaid', { unique: false });
      }

      // Accounts store (Bank accounts, Credit cards, Cash, Wallets)
      if (!db.objectStoreNames.contains('accounts')) {
        const accountStore = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
        accountStore.createIndex('type', 'type', { unique: false });
        accountStore.createIndex('name', 'name', { unique: false });
        accountStore.createIndex('currency', 'currency', { unique: false });
      }

      // Deposits store (FD, PPF, NPS, EPF, NSC, etc.)
      if (!db.objectStoreNames.contains('deposits')) {
        const depositStore = db.createObjectStore('deposits', { keyPath: 'id', autoIncrement: true });
        depositStore.createIndex('type', 'type', { unique: false });
        depositStore.createIndex('accountName', 'accountName', { unique: false });
        depositStore.createIndex('startDate', 'startDate', { unique: false });
        depositStore.createIndex('maturityDate', 'maturityDate', { unique: false });
      }
    };
  });
};

// Generic CRUD operations
export const addRecord = async (storeName, record) => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllRecords = async (storeName) => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateRecord = async (storeName, record) => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteRecord = async (storeName, id) => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getSetting = async (key) => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
  });
};

export const setSetting = async (key, value) => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key, value });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
