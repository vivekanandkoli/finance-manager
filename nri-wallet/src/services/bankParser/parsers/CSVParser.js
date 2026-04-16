/**
 * CSV Parser for Bank Statements
 * Parses CSV files from various banks
 */

import Papa from 'papaparse';

class CSVParser {
  /**
   * Parse CSV file
   * @param {File} file - CSV file
   * @returns {Promise<Object>} Parsed data
   */
  async parse(file) {
    const text = await this.readFileAsText(file);
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(this.formatResult(results, file));
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Read file as text
   */
  async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Format parsed CSV data
   */
  formatResult(results, file) {
    return {
      data: results.data || [],
      headers: results.meta?.fields || [],
      rowCount: results.data?.length || 0,
      errors: results.errors || [],
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date().toISOString(),
        hasHeaders: results.meta?.fields?.length > 0
      }
    };
  }

  /**
   * Detect CSV format/bank
   * (Will be improved in Phase 2)
   */
  detectFormat(headers) {
    const headerStr = headers.join(',').toLowerCase();
    
    // HDFC Bank
    if (headerStr.includes('date') && headerStr.includes('narration')) {
      return 'HDFC';
    }
    
    // ICICI Bank
    if (headerStr.includes('transaction date') && headerStr.includes('value date')) {
      return 'ICICI';
    }
    
    // SBI Bank
    if (headerStr.includes('txn date') && headerStr.includes('description')) {
      return 'SBI';
    }
    
    // Generic
    return 'GENERIC';
  }
}

export default CSVParser;
