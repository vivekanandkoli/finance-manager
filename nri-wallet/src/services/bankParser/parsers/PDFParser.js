/**
 * PDF Parser with Password Protection Support (Browser Compatible)
 * Extracts text from PDF files using pdfjs-dist
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

class PDFParser {
  /**
   * Parse PDF file
   * @param {File} file - PDF file
   * @param {string} password - Optional password
   * @returns {Promise<Object>} Extracted data
   */
  async parse(file, password = null) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Try to parse with pdfjs-dist
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password || undefined
      });
      
      const pdf = await loadingTask.promise;
      const text = await this.extractTextFromPDF(pdf);
      
      return this.formatResult({
        text: text,
        numPages: pdf.numPages,
        info: {}
      }, file);
      
    } catch (error) {
      // Check if it's a password error
      if (this.isPasswordError(error)) {
        if (!password) {
          const err = new Error('PASSWORD_REQUIRED');
          err.name = 'PasswordRequired';
          throw err;
        }
        
        const err = new Error('INCORRECT_PASSWORD');
        err.name = 'IncorrectPassword';
        throw err;
      }
      
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from all pages of PDF
   */
  async extractTextFromPDF(pdf) {
    const numPages = pdf.numPages;
    const textPromises = [];
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      textPromises.push(this.extractTextFromPage(pdf, pageNum));
    }
    
    const pageTexts = await Promise.all(textPromises);
    return pageTexts.join('\n');
  }

  /**
   * Extract text from a single page
   */
  async extractTextFromPage(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const strings = textContent.items.map(item => item.str);
    return strings.join(' ');
  }

  /**
   * Check if error is related to password
   */
  isPasswordError(error) {
    if (!error) return false;
    
    const errorStr = error.toString().toLowerCase();
    const message = error.message ? error.message.toLowerCase() : '';
    
    const passwordKeywords = [
      'password',
      'encrypted',
      'decrypt',
      'needpassword',
      'incorrectpassword'
    ];
    
    return passwordKeywords.some(kw => 
      errorStr.includes(kw) || message.includes(kw)
    );
  }

  /**
   * Format parsed PDF data
   */
  formatResult(data, file) {
    return {
      text: data.text || '',
      pages: data.numPages || 0,
      info: data.info || {},
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date().toISOString(),
        textLength: (data.text || '').length,
        hasText: !!data.text && data.text.length > 0
      }
    };
  }

  /**
   * Extract text lines from PDF
   */
  extractLines(text) {
    if (!text) return [];
    
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * Check if PDF is likely a bank statement
   */
  isBankStatement(text) {
    const bankKeywords = [
      'bank',
      'statement',
      'account',
      'balance',
      'transaction',
      'debit',
      'credit',
      'deposit',
      'withdrawal'
    ];
    
    const lowerText = text.toLowerCase();
    const foundKeywords = bankKeywords.filter(kw => lowerText.includes(kw));
    
    return foundKeywords.length >= 3;
  }
}

export default PDFParser;
