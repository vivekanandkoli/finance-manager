/**
 * Excel Parser for Bank Statements
 * Parses .xlsx and .xls files
 */

// Note: xlsx is already installed in your project

import * as XLSX from 'xlsx';

class ExcelParser {
  /**
   * Parse Excel file
   * @param {File} file - Excel file (.xlsx or .xls)
   * @returns {Promise<Object>} Parsed data
   */
  async parse(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1, // Get as array of arrays first
      defval: '',
      blankrows: false
    });
    
    // Extract headers (first non-empty row)
    let headers = [];
    let dataStartRow = 0;
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length > 0 && row.some(cell => cell !== '')) {
        headers = row;
        dataStartRow = i + 1;
        break;
      }
    }
    
    // Get data rows
    const dataRows = jsonData.slice(dataStartRow);
    
    // Convert to objects with headers as keys
    const rows = dataRows
      .filter(row => row && row.length > 0)
      .map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    
    return this.formatResult(rows, headers, workbook, file);
  }

  /**
   * Format parsed Excel data
   */
  formatResult(rows, headers, workbook, file) {
    return {
      data: rows,
      headers: headers,
      rowCount: rows.length,
      sheetNames: workbook.SheetNames,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date().toISOString(),
        sheets: workbook.SheetNames.length,
        hasHeaders: headers.length > 0
      }
    };
  }

  /**
   * Parse all sheets from Excel file
   * @param {File} file
   * @returns {Promise<Object>} Data from all sheets
   */
  async parseAllSheets(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    
    const allSheets = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      allSheets[sheetName] = jsonData;
    });
    
    return {
      sheets: allSheets,
      sheetNames: workbook.SheetNames,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date().toISOString(),
        totalSheets: workbook.SheetNames.length
      }
    };
  }
}

export default ExcelParser;
