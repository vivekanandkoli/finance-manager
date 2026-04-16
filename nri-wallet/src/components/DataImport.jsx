import React, { useState } from 'react';
import { seedComprehensiveData } from '../utils/seedData';
import { getAllRecords, addRecord } from '../db';
import * as XLSX from 'xlsx';
import './DataImport.css';

function DataImport() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImportVivekData = async () => {
    setLoading(true);
    setStatus('Importing your Excel data...');
    
    try {
      const response = await fetch('/vivek_import_data.json');
      const importData = await response.json();
      
      let totalImported = 0;
      
      // Import expenses
      if (importData.expenses) {
        for (const expense of importData.expenses) {
          await addRecord('expenses', expense);
          totalImported++;
        }
      }
      
      // Import investments
      if (importData.investments) {
        for (const investment of importData.investments) {
          await addRecord('investments', investment);
          totalImported++;
        }
      }
      
      // Import loans
      if (importData.loans) {
        for (const loan of importData.loans) {
          await addRecord('loans', loan);
          totalImported++;
        }
      }
      
      // Import budgets
      if (importData.budgets) {
        for (const budget of importData.budgets) {
          await addRecord('budgets', budget);
          totalImported++;
        }
      }
      
      // Import goals
      if (importData.goals) {
        for (const goal of importData.goals) {
          await addRecord('goals', goal);
          totalImported++;
        }
      }
      
      setStatus(`✅ Successfully imported ${totalImported} records from your Excel file!\n` +
                `📊 ${importData.expenses?.length || 0} expenses\n` +
                `💰 ${importData.investments?.length || 0} investments\n` +
                `🏦 ${importData.loans?.length || 0} loans`);
      
      // Reload page to refresh data
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setStatus('❌ Error importing data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    setStatus('Seeding sample data...');
    
    try {
      await seedComprehensiveData();
      setStatus('✅ Sample data imported successfully!');
    } catch (error) {
      setStatus('❌ Error importing data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus('Importing file...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Process sheets
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Import data based on structure
      for (const row of jsonData) {
        if (row.amount && row.category) {
          await addRecord('expenses', {
            ...row,
            timestamp: new Date().toISOString()
          });
        }
      }

      setStatus(`✅ Imported ${jsonData.length} records successfully!`);
    } catch (error) {
      setStatus('❌ Error importing file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setStatus('Exporting data...');

    try {
      const expenses = await getAllRecords('expenses');
      const investments = await getAllRecords('investments');
      const loans = await getAllRecords('loans');
      const goals = await getAllRecords('goals');
      const budgets = await getAllRecords('budgets');

      const workbook = XLSX.utils.book_new();
      
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenses), 'Expenses');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(investments), 'Investments');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(loans), 'Loans');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(goals), 'Goals');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(budgets), 'Budgets');

      XLSX.writeFile(workbook, 'NRI_Wallet_Export.xlsx');
      setStatus('✅ Data exported successfully!');
    } catch (error) {
      setStatus('❌ Error exporting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-import">
      <div className="data-import-header">
        <h2>📥 Import & Export Data</h2>
        <p className="data-import-subtitle">Manage your financial data - import, export, and backup</p>
      </div>

      <div className="import-section">
        <div className="import-card primary-import">
          <h3>📊 Import YOUR Excel Data</h3>
          <p>Load your data from "Vivek financial planner v3.xlsx"</p>
          <p style={{ fontSize: '13px', opacity: 0.95, margin: '12px 0 20px 0' }}>
            ✅ 316 expenses • 7 investments • 1 loan
          </p>
          <button 
            onClick={handleImportVivekData} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ display: 'inline-block', width: '16px', height: '16px', marginRight: '8px' }}></span>
                Importing...
              </>
            ) : (
              '⚡ Import My Data Now'
            )}
          </button>
        </div>

        <div className="import-card">
          <h3>💾 Export to Excel</h3>
          <p>Download all your data in Excel format for backup or analysis</p>
          <button onClick={handleExport} disabled={loading}>
            {loading ? 'Exporting...' : '📤 Export Data'}
          </button>
        </div>

        <div className="import-card">
          <h3>📄 Import Custom Excel</h3>
          <p>Upload your own Excel file with financial data</p>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileImport}
            disabled={loading}
          />
        </div>

        <div className="import-card">
          <h3>🎯 Load Sample Data</h3>
          <p>Try the app with pre-populated sample financial data</p>
          <button onClick={handleSeedData} disabled={loading}>
            {loading ? 'Loading...' : '🎲 Load Sample Data'}
          </button>
        </div>
      </div>

      {status && (
        <div className={`status-message ${status.includes('❌') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default DataImport;
