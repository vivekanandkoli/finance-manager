/**
 * Data Recovery Utilities
 * Helper functions to check and recover data from IndexedDB
 */

export async function checkDataIntegrity() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NRIWalletDB', 3);
    
    request.onsuccess = async (event) => {
      const db = event.target.result;
      const stores = ['accounts', 'expenses', 'income', 'deposits', 'investments', 'loans', 'bills'];
      const results = {};
      
      try {
        for (const storeName of stores) {
          if (db.objectStoreNames.contains(storeName)) {
            const tx = db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            
            const data = await new Promise((res, rej) => {
              request.onsuccess = () => res(request.result);
              request.onerror = () => rej(request.error);
            });
            
            results[storeName] = {
              count: data.length,
              data: data
            };
          } else {
            results[storeName] = {
              count: 0,
              data: [],
              missing: true
            };
          }
        }
        
        resolve(results);
      } catch (error) {
        reject(error);
      } finally {
        db.close();
      }
    };
    
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database access blocked'));
  });
}

export async function exportAllData() {
  const integrity = await checkDataIntegrity();
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    data: {}
  };
  
  for (const [storeName, storeData] of Object.entries(integrity)) {
    exportData.data[storeName] = storeData.data;
  }
  
  return exportData;
}

export async function downloadDataBackup() {
  const data = await exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nri-wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatDataReport(integrity) {
  let report = '📊 Data Integrity Report\n';
  report += '━'.repeat(50) + '\n\n';
  
  let totalRecords = 0;
  
  for (const [storeName, storeData] of Object.entries(integrity)) {
    if (storeData.missing) {
      report += `❌ ${storeName}: Store missing!\n`;
    } else {
      totalRecords += storeData.count;
      report += `✅ ${storeName}: ${storeData.count} records\n`;
    }
  }
  
  report += '\n' + '━'.repeat(50) + '\n';
  report += `Total Records: ${totalRecords}\n`;
  
  return report;
}
