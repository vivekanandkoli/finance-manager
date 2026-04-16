# 🚀 Phase 1: Bank Statement Parser - Implementation

**Timeline:** Week 1-2  
**Goal:** Basic multi-file upload with password support + text extraction  
**Status:** 🟢 In Progress

---

## 🎯 Phase 1 Deliverables

### Must Have ✅
1. Multiple file upload (PDF, CSV, Excel)
2. Password input for each file
3. Extract text/data from files
4. Show preview of extracted data
5. File validation and error handling
6. Progress indicators

### Nice to Have (Later)
- Auto-detect bank format
- Parse transactions
- Import to database

---

## 📦 Step 1: Install Dependencies

```bash
cd nri-wallet
npm install pdf-parse papaparse pdf-lib
```

**Libraries:**
- `pdf-parse` - Extract text from PDFs
- `papaparse` - Parse CSV files
- `pdf-lib` - Handle password-protected PDFs
- `xlsx` - Already installed for Excel

---

## 🏗️ Step 2: Create Service Structure

### Files to Create:

```
src/services/bankParser/
├── BankStatementService.js       # Main orchestrator
├── parsers/
│   ├── PDFParser.js              # PDF parsing + password handling
│   ├── CSVParser.js              # CSV parsing
│   └── ExcelParser.js            # Excel parsing
└── utils/
    └── FileValidator.js          # File type & size validation
```

---

## 🎨 Step 3: Create UI Component

### Component Structure:

```
src/components/
├── BankStatementUploader.jsx     # Main uploader component
├── BankStatementUploader.css     # Styles
└── PasswordPrompt.jsx            # Password modal for each file
```

---

## 💻 Implementation Details

### 1. BankStatementUploader Component

**Features:**
- Drag & drop multiple files
- File type validation (PDF, CSV, XLSX)
- Password prompt for each PDF
- Progress indicator per file
- Preview extracted data
- Batch upload support

**UI Flow:**
```
[Upload Area] 
    ↓
[Select Multiple Files]
    ↓
[For each PDF: Ask password]
    ↓
[Extract data from all files]
    ↓
[Show combined preview]
    ↓
[Continue to next phase...]
```

### 2. Password-Protected PDF Handling

**Approach:**
```javascript
// Try without password first
try {
  data = await parsePDF(file);
} catch (error) {
  if (error.message.includes('password')) {
    // Prompt user for password
    password = await askForPassword();
    data = await parsePDF(file, password);
  }
}
```

### 3. Multiple File Upload

**Features:**
- Upload 10+ files at once
- Process sequentially or in parallel
- Show progress for each file
- Handle errors individually
- Combine results

---

## 🎯 User Experience Flow

### Upload Flow:

```
Step 1: User selects/drops multiple files
┌─────────────────────────────────────┐
│  📄 HDFC_Jan2026.pdf                │
│  📄 HDFC_Feb2026.pdf                │
│  📊 ICICI_Statement.csv             │
│  📊 CreditCard_Mar2026.xlsx         │
└─────────────────────────────────────┘

Step 2: Password prompts (for PDFs)
┌─────────────────────────────────────┐
│  🔒 Enter password for:             │
│     HDFC_Jan2026.pdf                │
│                                      │
│  Password: [__________] [OK]        │
└─────────────────────────────────────┘

Step 3: Processing
┌─────────────────────────────────────┐
│  ✅ HDFC_Jan2026.pdf - Done         │
│  ⏳ HDFC_Feb2026.pdf - Processing   │
│  ⏸️ ICICI_Statement.csv - Waiting   │
│  ⏸️ CreditCard_Mar2026.xlsx - Wait  │
└─────────────────────────────────────┘

Step 4: Preview Combined Data
┌─────────────────────────────────────┐
│  Successfully extracted from 4 files │
│  Total: 147 transactions found      │
│                                      │
│  [View Details] [Continue]          │
└─────────────────────────────────────┘
```

---

## 📝 Code Structure

### BankStatementService.js (Main)

```javascript
class BankStatementService {
  constructor() {
    this.pdfParser = new PDFParser();
    this.csvParser = new CSVParser();
    this.excelParser = new ExcelParser();
  }

  async processFiles(files, passwords = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.processFile(file, passwords[file.name]);
        results.push({
          fileName: file.name,
          status: 'success',
          data: result
        });
      } catch (error) {
        results.push({
          fileName: file.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }

  async processFile(file, password = null) {
    const fileType = this.getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return await this.pdfParser.parse(file, password);
      case 'csv':
        return await this.csvParser.parse(file);
      case 'xlsx':
        return await this.excelParser.parse(file);
      default:
        throw new Error('Unsupported file type');
    }
  }
}
```

### PDFParser.js (Password Support)

```javascript
import PDFParser from 'pdf-parse';
import { PDFDocument } from 'pdf-lib';

class PDFParser {
  async parse(file, password = null) {
    const buffer = await file.arrayBuffer();
    
    try {
      // Try parsing without password
      const data = await PDFParser(buffer);
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      if (this.isPasswordError(error)) {
        if (!password) {
          throw new Error('PASSWORD_REQUIRED');
        }
        // Try with password
        return await this.parseWithPassword(buffer, password);
      }
      throw error;
    }
  }

  async parseWithPassword(buffer, password) {
    try {
      // Load PDF with password using pdf-lib
      const pdfDoc = await PDFDocument.load(buffer, { 
        password: password,
        ignoreEncryption: false 
      });
      
      // Convert back to buffer
      const pdfBytes = await pdfDoc.save();
      
      // Now parse with pdf-parse
      const data = await PDFParser(pdfBytes);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      if (error.message.includes('password')) {
        throw new Error('INCORRECT_PASSWORD');
      }
      throw error;
    }
  }

  isPasswordError(error) {
    const passwordKeywords = [
      'password',
      'encrypted',
      'decrypt',
      'authorization'
    ];
    
    const errorMsg = error.message.toLowerCase();
    return passwordKeywords.some(kw => errorMsg.includes(kw));
  }
}
```

### BankStatementUploader Component

```javascript
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import BankStatementService from '../services/bankParser/BankStatementService';
import PasswordPrompt from './PasswordPrompt';

function BankStatementUploader({ onComplete }) {
  const [files, setFiles] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPasswordFile, setCurrentPasswordFile] = useState(null);

  const bankService = new BankStatementService();

  // Drag & drop setup
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true,
    onDrop: handleFileDrop
  });

  function handleFileDrop(acceptedFiles) {
    setFiles(acceptedFiles);
    // Check which files need passwords (PDFs)
    const pdfFiles = acceptedFiles.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setCurrentPasswordFile(pdfFiles[0]); // Ask for first PDF
    } else {
      // No PDFs, process directly
      processAllFiles(acceptedFiles, {});
    }
  }

  function handlePasswordSubmit(file, password) {
    const newPasswords = { ...passwords, [file.name]: password };
    setPasswords(newPasswords);
    
    // Find next PDF that needs password
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    const nextPdf = pdfFiles.find(f => !newPasswords[f.name]);
    
    if (nextPdf) {
      setCurrentPasswordFile(nextPdf);
    } else {
      // All passwords collected, process files
      setCurrentPasswordFile(null);
      processAllFiles(files, newPasswords);
    }
  }

  async function processAllFiles(filesToProcess, filePasswords) {
    setProcessing(true);
    
    try {
      const results = await bankService.processFiles(filesToProcess, filePasswords);
      setResults(results);
      
      if (onComplete) {
        onComplete(results);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bank-statement-uploader">
      <h2>📁 Upload Bank Statements</h2>
      
      {/* Drag & Drop Area */}
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>📄 Drag & drop bank statements here</p>
        <p className="hint">or click to select files</p>
        <p className="formats">Supports: PDF, CSV, Excel (.xlsx, .xls)</p>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files ({files.length})</h3>
          {files.map((file, idx) => (
            <div key={idx} className="file-item">
              <span>📄 {file.name}</span>
              <span className="size">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </div>
      )}

      {/* Password Prompt Modal */}
      {currentPasswordFile && (
        <PasswordPrompt
          file={currentPasswordFile}
          onSubmit={handlePasswordSubmit}
          onSkip={() => setCurrentPasswordFile(null)}
        />
      )}

      {/* Processing Status */}
      {processing && (
        <div className="processing">
          <div className="spinner"></div>
          <p>Processing {files.length} files...</p>
        </div>
      )}

      {/* Results Preview */}
      {results.length > 0 && (
        <div className="results">
          <h3>✅ Extraction Complete!</h3>
          {results.map((result, idx) => (
            <div key={idx} className={`result-item ${result.status}`}>
              <span>{result.fileName}</span>
              {result.status === 'success' ? (
                <span className="success">✅ Success</span>
              ) : (
                <span className="error">❌ {result.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BankStatementUploader;
```

### PasswordPrompt Component

```javascript
import React, { useState } from 'react';

function PasswordPrompt({ file, onSubmit, onSkip }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    onSubmit(file, password);
  }

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <h3>🔒 Password Required</h3>
        <p className="file-name">{file.name}</p>
        <p className="hint">This PDF is password protected</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          
          {error && <p className="error">{error}</p>}
          
          <div className="buttons">
            <button type="button" onClick={onSkip} className="skip-btn">
              Skip
            </button>
            <button type="submit" className="submit-btn">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordPrompt;
```

---

## 🎨 Styling

### BankStatementUploader.css

```css
.bank-statement-uploader {
  padding: 20px;
}

.dropzone {
  border: 2px dashed #4CAF50;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone:hover {
  border-color: #45a049;
  background: #f0f9f0;
}

.dropzone p {
  margin: 8px 0;
}

.dropzone .hint {
  color: #666;
  font-size: 14px;
}

.dropzone .formats {
  color: #999;
  font-size: 12px;
  margin-top: 16px;
}

.selected-files {
  margin-top: 20px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 8px 0;
}

.file-item .size {
  color: #666;
  font-size: 14px;
}

/* Password Modal */
.password-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.password-modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.password-modal h3 {
  margin: 0 0 16px 0;
}

.password-modal .file-name {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
  word-break: break-all;
}

.password-modal input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin: 16px 0;
}

.password-modal .buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.password-modal button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.password-modal .skip-btn {
  background: #ddd;
  color: #333;
}

.password-modal .submit-btn {
  background: #4CAF50;
  color: white;
}

.password-modal .error {
  color: #f44336;
  font-size: 14px;
  margin: 8px 0;
}

/* Processing */
.processing {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Results */
.results {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  margin: 8px 0;
  border-radius: 4px;
}

.result-item.success {
  background: #e8f5e9;
}

.result-item.error {
  background: #ffebee;
}

.result-item .success {
  color: #4CAF50;
}

.result-item .error {
  color: #f44336;
}
```

---

## ✅ Phase 1 Acceptance Criteria

### Must Work:
- [ ] Upload single PDF with password
- [ ] Upload multiple PDFs with different passwords
- [ ] Upload CSV files
- [ ] Upload Excel files
- [ ] Mix of PDF, CSV, Excel in one upload
- [ ] Show error for wrong password
- [ ] Show error for corrupted files
- [ ] Extract text from all files successfully
- [ ] Show combined preview of all extracted data

### Should Handle:
- [ ] Large files (10MB+)
- [ ] 10+ files at once
- [ ] Skip password if user doesn't know
- [ ] Retry with different password
- [ ] Cancel upload in progress

---

## 🧪 Testing Plan

### Test Cases:

1. **Single password-protected PDF**
   - Upload → Enter password → Extract text

2. **Multiple PDFs with same password**
   - Upload 3 PDFs → Enter password once → Apply to all

3. **Multiple PDFs with different passwords**
   - Upload 3 PDFs → Enter password for each → Process all

4. **Wrong password**
   - Upload PDF → Enter wrong password → Show error → Retry

5. **Mix of files**
   - Upload 2 PDFs, 1 CSV, 1 Excel → Process all → Success

6. **Corrupted file**
   - Upload corrupted PDF → Show error → Continue with others

---

## 📅 Timeline

### Week 1:
- **Day 1-2:** Install dependencies, create file structure
- **Day 3-4:** Implement PDFParser with password support
- **Day 5:** Implement CSVParser and ExcelParser

### Week 2:
- **Day 1-2:** Build BankStatementUploader UI component
- **Day 3:** Build PasswordPrompt component
- **Day 4:** Testing and bug fixes
- **Day 5:** Polish and documentation

---

## 🎯 Success Metrics

By end of Phase 1:
- ✅ Can upload multiple files
- ✅ Can handle password-protected PDFs
- ✅ Extracts text from all supported formats
- ✅ Shows clear preview of extracted data
- ✅ Good UX with progress indicators
- ✅ Ready for Phase 2 (transaction parsing)

---

## 🚀 Let's Start!

Ready to begin implementation?

**Next Actions:**
1. Install dependencies
2. Create folder structure
3. Implement PDFParser first
4. Then build UI components

**Do you want me to:**
- ✅ Create all the implementation files now?
- ⏸️ Start with one piece at a time?
- 📋 Need clarification on anything?

Let me know and I'll start creating the code! 🚀
