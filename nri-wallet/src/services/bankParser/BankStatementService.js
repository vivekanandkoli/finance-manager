/**
 * Bank Statement Service
 * Main orchestrator for parsing bank statements
 * Supports: PDF (password-protected), CSV, Excel
 */

import PDFParser from './parsers/PDFParser';
import CSVParser from './parsers/CSVParser';
import ExcelParser from './parsers/ExcelParser';

class BankStatementService {
  constructor() {
    this.pdfParser = new PDFParser();
    this.csvParser = new CSVParser();
    this.excelParser = new ExcelParser();
  }

  /**
   * Process multiple files with optional passwords
   * @param {File[]} files - Array of files to process
   * @param {Object} passwords - Object mapping filename to password
   * @param {Function} onProgress - Progress callback (fileName, status, progress)
   * @returns {Promise<Array>} Results for each file
   */
  async processFiles(files, passwords = {}, onProgress = null) {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (onProgress) {
        onProgress(file.name, 'processing', (i / files.length) * 100);
      }
      
      try {
        const result = await this.processFile(file, passwords[file.name]);
        
        results.push({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          status: 'success',
          data: result,
          timestamp: new Date().toISOString()
        });
        
        if (onProgress) {
          onProgress(file.name, 'success', ((i + 1) / files.length) * 100);
        }
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        results.push({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          status: 'error',
          error: error.message,
          errorType: error.name,
          timestamp: new Date().toISOString()
        });
        
        if (onProgress) {
          onProgress(file.name, 'error', ((i + 1) / files.length) * 100);
        }
      }
    }
    
    return results;
  }

  /**
   * Process a single file
   * @param {File} file - File to process
   * @param {string} password - Optional password for PDF
   * @returns {Promise<Object>} Extracted data
   */
  async processFile(file, password = null) {
    const fileType = this.getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return await this.pdfParser.parse(file, password);
      
      case 'csv':
        return await this.csvParser.parse(file);
      
      case 'excel':
        return await this.excelParser.parse(file);
      
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  /**
   * Determine file type from File object
   * @param {File} file
   * @returns {string} 'pdf', 'csv', or 'excel'
   */
  getFileType(file) {
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf';
    }
    
    if (mimeType === 'text/csv' || fileName.endsWith('.csv')) {
      return 'csv';
    }
    
    if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls')
    ) {
      return 'excel';
    }
    
    throw new Error('Unknown file type');
  }

  /**
   * Validate file before processing
   * @param {File} file
   * @returns {Object} { valid: boolean, error: string }
   */
  validateFile(file) {
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 50MB)`
      };
    }
    
    // Check file type
    try {
      this.getFileType(file);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Batch validate multiple files
   * @param {File[]} files
   * @returns {Object} { valid: File[], invalid: Array<{file, error}> }
   */
  validateFiles(files) {
    const valid = [];
    const invalid = [];
    
    for (const file of files) {
      const validation = this.validateFile(file);
      
      if (validation.valid) {
        valid.push(file);
      } else {
        invalid.push({
          file,
          error: validation.error
        });
      }
    }
    
    return { valid, invalid };
  }
}

export default BankStatementService;
