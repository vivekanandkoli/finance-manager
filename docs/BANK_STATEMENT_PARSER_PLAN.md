# 🏦 Bank Statement Parser - Feature Plan

**Goal:** Automatically extract expenses and income from bank statements (PDF/CSV/Excel) from Indian and Thai banks.

---

## 📊 Current State Analysis

### ✅ What We Already Have
1. **File Upload Infrastructure** - `DataImport.jsx` component
2. **Excel Parsing** - Using `xlsx` library
3. **ML Categorization** - Naive Bayes classifier in `categorizationService.js`
4. **Database Structure** - IndexedDB with expenses/income tables
5. **Merchant Pattern Matching** - Pre-defined patterns for auto-categorization

### 🎯 What We Need to Add
1. **PDF parsing** - Extract text from bank statement PDFs
2. **Multi-format support** - Different banks have different formats
3. **Transaction detection** - Identify transaction rows in statements
4. **Debit/Credit classification** - Distinguish income vs expense
5. **Smart date parsing** - Handle various date formats
6. **Amount extraction** - Parse amounts with different formats
7. **Bank format detection** - Auto-detect which bank the statement is from
8. **Duplicate prevention** - Don't import same transactions twice

---

## 🏦 Target Banks

### Indian Banks (Priority)
1. **HDFC Bank** - PDF & Excel
2. **ICICI Bank** - PDF & Excel
3. **SBI (State Bank of India)** - PDF & Excel
4. **Axis Bank** - PDF & Excel
5. **Kotak Mahindra** - PDF & Excel
6. **IDFC First Bank** - PDF & Excel

### Indian Credit Cards
1. **HDFC Credit Card** - PDF
2. **ICICI Credit Card** - PDF
3. **SBI Credit Card** - PDF
4. **American Express** - PDF & CSV

### Thai Banks (Future)
1. **Bangkok Bank** - PDF & CSV
2. **Kasikorn Bank (K-Bank)** - PDF & CSV
3. **Siam Commercial Bank (SCB)** - PDF & CSV
4. **Krung Thai Bank (KTB)** - PDF & CSV

---

## 🎨 Architecture Design

### Phase 1: Core Infrastructure
```
BankStatementParser/
├── parsers/
│   ├── PDFParser.js          # Extract text from PDF
│   ├── CSVParser.js          # Parse CSV statements
│   ├── ExcelParser.js        # Parse Excel statements
│   └── TextExtractor.js      # Clean and normalize text
│
├── detectors/
│   ├── BankDetector.js       # Identify which bank
│   ├── FormatDetector.js     # Detect statement format
│   └── TransactionDetector.js # Find transaction lines
│
├── extractors/
│   ├── DateExtractor.js      # Extract & parse dates
│   ├── AmountExtractor.js    # Extract amounts
│   ├── DescriptionExtractor.js # Extract descriptions
│   └── BalanceExtractor.js   # Extract balances
│
├── classifiers/
│   ├── TransactionClassifier.js  # Debit vs Credit
│   ├── CategoryClassifier.js     # Auto-categorize
│   └── MerchantExtractor.js      # Extract merchant names
│
└── BankStatementService.js   # Main orchestrator
```

### Phase 2: Bank-Specific Parsers
```
banks/
├── indian/
│   ├── HDFCParser.js
│   ├── ICICIParser.js
│   ├── SBIParser.js
│   ├── AxisParser.js
│   └── KotakParser.js
│
├── thai/
│   ├── BangkokBankParser.js
│   ├── KBankParser.js
│   └── SCBParser.js
│
└── BaseParser.js             # Common parsing logic
```

---

## 🔧 Technical Implementation

### 1. PDF Parsing Library
**Options:**
- **pdf-parse** (lightweight, good for text extraction)
- **pdfjs-dist** (Mozilla's PDF.js, more powerful)
- **pdf2json** (converts PDF to JSON)

**Recommendation:** Start with **pdf-parse** for simplicity

```javascript
npm install pdf-parse
```

### 2. Pattern Matching Approach

#### Example: HDFC Bank Statement Pattern
```javascript
const HDFCPatterns = {
  transactionLine: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+(Cr|Dr)/,
  dateFormat: 'DD/MM/YYYY',
  debitIndicator: ['Dr', 'Debit'],
  creditIndicator: ['Cr', 'Credit'],
  headerIndicators: ['Date', 'Description', 'Amount', 'Balance']
};
```

#### Example: ICICI Credit Card Pattern
```javascript
const ICICICreditCardPatterns = {
  transactionLine: /(\d{2}\s\w{3}\s\d{4})\s+(\d{2}\s\w{3})\s+(.+?)\s+([\d,]+\.\d{2})/,
  dateFormat: 'DD MMM YYYY',
  skipLines: ['ICICI Bank Limited', 'Statement Summary', 'Previous Balance']
};
```

### 3. Transaction Detection Algorithm

```javascript
class TransactionDetector {
  detectTransactions(text, bankType) {
    const lines = text.split('\n');
    const transactions = [];
    
    for (const line of lines) {
      // Skip header/footer lines
      if (this.isHeaderOrFooter(line)) continue;
      
      // Try to match transaction pattern
      const match = this.matchTransactionPattern(line, bankType);
      
      if (match) {
        transactions.push({
          date: match.date,
          description: match.description,
          amount: match.amount,
          type: match.type, // 'credit' or 'debit'
          rawLine: line
        });
      }
    }
    
    return transactions;
  }
}
```

### 4. Smart Amount Parser

```javascript
class AmountExtractor {
  extractAmount(text) {
    // Handle various formats:
    // Indian: 1,23,456.78
    // Thai: 123,456.78
    // International: 123456.78
    
    const patterns = [
      /(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/,  // Indian format
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,    // Standard format
      /(\d+\.\d{2})/                          // Simple format
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    
    return null;
  }
}
```

### 5. Debit/Credit Classification

```javascript
class TransactionClassifier {
  classifyTransaction(transaction, bankType) {
    // Method 1: Look for explicit indicators
    if (transaction.rawLine.includes('Cr') || 
        transaction.rawLine.includes('Credit')) {
      return 'income';
    }
    
    if (transaction.rawLine.includes('Dr') || 
        transaction.rawLine.includes('Debit')) {
      return 'expense';
    }
    
    // Method 2: Look at description keywords
    const incomeKeywords = ['salary', 'refund', 'cashback', 'interest earned'];
    const expenseKeywords = ['purchase', 'payment', 'withdrawal', 'fee'];
    
    const desc = transaction.description.toLowerCase();
    
    if (incomeKeywords.some(kw => desc.includes(kw))) {
      return 'income';
    }
    
    if (expenseKeywords.some(kw => desc.includes(kw))) {
      return 'expense';
    }
    
    // Method 3: Use existing ML classifier
    return this.mlClassifier.predict(transaction.description);
  }
}
```

---

## 🎯 User Flow Design

### Step 1: Upload Statement
```
[Upload Bank Statement] 
    ↓
[Drag & Drop or Select File]
    ↓
[Support: PDF, CSV, Excel]
```

### Step 2: Auto-Detection
```
[Analyzing statement...] 
    ↓
[Detected: HDFC Bank Statement - Jan 2026]
    ↓
[Found: 47 transactions]
```

### Step 3: Preview & Review
```
┌─────────────────────────────────────────┐
│ Preview Transactions (47 found)         │
├─────────────────────────────────────────┤
│ ✅ 15 Jan | Swiggy Order    | ₹450 (E) │
│ ✅ 16 Jan | Salary Credit   | ₹85,000  │
│ ⚠️  17 Jan | Unknown Vendor | ₹1,200   │
│ ✅ 18 Jan | Amazon Purchase | ₹2,300   │
└─────────────────────────────────────────┘

[✓] Auto-categorize transactions
[✓] Skip duplicates
[ ] Mark uncertain as pending review

        [Cancel]  [Import 47 Transactions]
```

### Step 4: Import & Categorize
```
[Importing transactions...]
    ↓
✅ 45 transactions imported
⚠️  2 transactions need review
    ↓
[View Imported Transactions]
```

---

## 🎨 UI Components

### 1. Bank Statement Uploader Component
```javascript
<BankStatementUploader>
  - File drop zone
  - Support indicators (PDF, CSV, Excel)
  - Supported banks list
  - Processing status
</BankStatementUploader>
```

### 2. Transaction Preview Component
```javascript
<TransactionPreview>
  - List of detected transactions
  - Confidence scores
  - Edit capabilities
  - Category suggestions
  - Duplicate warnings
</TransactionPreview>
```

### 3. Review Required Component
```javascript
<ReviewRequired>
  - Uncertain transactions
  - Manual categorization
  - Amount verification
  - Date confirmation
</ReviewRequired>
```

---

## 📋 Implementation Phases

### **Phase 1: Foundation (Week 1-2)** ⭐ START HERE
**Goal:** Basic PDF & CSV parsing infrastructure

**Tasks:**
1. ✅ Install PDF parsing library
2. ✅ Create `BankStatementService.js` skeleton
3. ✅ Create UI component for statement upload
4. ✅ Implement basic PDF text extraction
5. ✅ Implement CSV parsing
6. ✅ Add file type validation
7. ✅ Create transaction preview UI

**Deliverable:** Can upload PDF/CSV and see extracted text

---

### **Phase 2: Pattern Matching (Week 3-4)**
**Goal:** Parse one Indian bank successfully (HDFC)

**Tasks:**
1. ✅ Study HDFC bank statement format
2. ✅ Create regex patterns for HDFC
3. ✅ Implement date extraction
4. ✅ Implement amount extraction
5. ✅ Implement description extraction
6. ✅ Detect debit/credit correctly
7. ✅ Test with sample HDFC statements

**Deliverable:** Successfully parse HDFC bank statements

---

### **Phase 3: Multi-Bank Support (Week 5-6)**
**Goal:** Support 3-4 major Indian banks

**Tasks:**
1. ✅ Add ICICI parser
2. ✅ Add SBI parser
3. ✅ Add Axis Bank parser
4. ✅ Create bank detector (auto-identify bank)
5. ✅ Create format detector
6. ✅ Test with real statements from each bank

**Deliverable:** Support HDFC, ICICI, SBI, Axis

---

### **Phase 4: Smart Features (Week 7-8)**
**Goal:** Intelligent categorization & duplicate detection

**Tasks:**
1. ✅ Integrate with existing ML categorization
2. ✅ Add merchant name extraction
3. ✅ Implement duplicate detection
4. ✅ Add confidence scoring
5. ✅ Create review UI for uncertain transactions
6. ✅ Add bulk edit capabilities

**Deliverable:** Smart, accurate auto-categorization

---

### **Phase 5: Credit Cards (Week 9-10)**
**Goal:** Support credit card statements

**Tasks:**
1. ✅ Study credit card statement formats
2. ✅ Add credit card specific parsers
3. ✅ Handle EMI transactions
4. ✅ Handle reward points
5. ✅ Handle bill payment vs purchases

**Deliverable:** Support major credit cards

---

### **Phase 6: Thai Banks (Week 11-12)**
**Goal:** Support Thai bank statements

**Tasks:**
1. ✅ Study Thai bank statement formats
2. ✅ Add Bangkok Bank parser
3. ✅ Add K-Bank parser
4. ✅ Add SCB parser
5. ✅ Handle Thai Baht formatting
6. ✅ Handle Thai language descriptions

**Deliverable:** Support 3 major Thai banks

---

### **Phase 7: Polish & Optimization (Week 13-14)**
**Goal:** Production-ready feature

**Tasks:**
1. ✅ Optimize parsing speed
2. ✅ Add progress indicators
3. ✅ Improve error handling
4. ✅ Add comprehensive testing
5. ✅ Create user documentation
6. ✅ Add sample statement templates

**Deliverable:** Production-ready feature

---

## 🎯 Success Metrics

### Accuracy Targets
- **Date Extraction:** 99%+ accuracy
- **Amount Extraction:** 99%+ accuracy
- **Transaction Detection:** 95%+ accuracy
- **Debit/Credit Classification:** 90%+ accuracy
- **Auto-Categorization:** 75%+ accuracy
- **Duplicate Detection:** 100% accuracy

### Performance Targets
- **Upload Time:** < 2 seconds
- **Parsing Time:** < 5 seconds for 100 transactions
- **Preview Load:** < 1 second

### User Experience
- **Max 2 clicks** to upload and import
- **Visual feedback** at every step
- **Easy review** of uncertain transactions
- **Undo capability** for imported transactions

---

## 🔒 Data Privacy & Security

### Considerations
1. **Local Processing:** All parsing happens in browser (no server upload)
2. **No Data Storage:** Statement files not saved, only extracted transactions
3. **User Control:** User reviews before final import
4. **Encryption:** IndexedDB data encrypted at rest
5. **No Cloud:** Everything stored locally

---

## 🧪 Testing Strategy

### Test Cases Needed
1. **Format Variations:**
   - Different date formats
   - Different amount formats
   - Different column orders
   - Multi-page statements

2. **Edge Cases:**
   - Very large statements (1000+ transactions)
   - Corrupted PDFs
   - Password-protected PDFs
   - Scanned PDFs (OCR needed)
   - Mixed language statements

3. **Real-World Testing:**
   - Test with actual bank statements
   - Test with multiple months
   - Test with different account types
   - Test with joint accounts

---

## 📚 Required Libraries

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",           // PDF parsing
    "papaparse": "^5.4.1",           // CSV parsing
    "xlsx": "^0.18.5",               // Already installed
    "date-fns": "^4.1.0",            // Already installed
    "natural": "^8.1.1",             // Already installed
    "fuzzball": "^2.1.2"             // Fuzzy string matching
  }
}
```

---

## 💰 Estimated Effort

### Time Breakdown
- **Phase 1:** 2 weeks (Foundation)
- **Phase 2:** 2 weeks (First bank)
- **Phase 3:** 2 weeks (Multi-bank)
- **Phase 4:** 2 weeks (Smart features)
- **Phase 5:** 2 weeks (Credit cards)
- **Phase 6:** 2 weeks (Thai banks)
- **Phase 7:** 2 weeks (Polish)

**Total:** ~14 weeks (3.5 months)

### Complexity Level
- **Overall:** High
- **PDF Parsing:** Medium
- **Pattern Matching:** High (varies by bank)
- **ML Integration:** Medium (leverage existing)
- **UI/UX:** Low (reuse existing components)

---

## 🚀 Quick Start (Phase 1)

### Immediate Next Steps

1. **Install Dependencies:**
```bash
cd nri-wallet
npm install pdf-parse papaparse fuzzball
```

2. **Create Service Structure:**
```bash
mkdir -p src/services/bankParser
```

3. **Create Files:**
- `src/services/bankParser/BankStatementService.js`
- `src/services/bankParser/PDFParser.js`
- `src/services/bankParser/CSVParser.js`
- `src/components/BankStatementUploader.jsx`

4. **Start with PDF Text Extraction:**
Focus on just extracting text from PDF first, then worry about parsing.

---

## 🤝 Agreement Required

Before implementation, let's agree on:

1. **✅ Phase 1 Scope:** Basic PDF/CSV upload and text extraction
2. **✅ Target Bank Priority:** Start with HDFC (most common)
3. **✅ UI Location:** Add to DataImport component or separate tab?
4. **✅ Timeline:** 2 weeks per phase reasonable?
5. **✅ Testing:** Need sample statements (anonymized) for testing
6. **✅ Error Handling:** How to handle uncertain transactions?

---

## 📝 Questions to Clarify

1. **Which Indian bank do you use most?** (We'll start with that one)
2. **Do you have sample statements?** (Anonymized for testing)
3. **Priority:** Indian banks first or Thai banks first?
4. **Credit cards:** Important or can wait?
5. **Password-protected PDFs:** Need support?
6. **OCR:** Support scanned statements or only digital PDFs?

---

## 🎯 Recommendation

**Start with Phase 1:**
- Simple PDF upload
- Extract text
- Display raw text
- Preview UI

**Get this working first** (2-3 days), then move to pattern matching.

**Most Important:** Get sample statements for testing!

---

Would you like to:
1. ✅ **Proceed with Phase 1?** 
2. ✅ **Modify the plan?**
3. ✅ **Start implementation?**

Let me know your thoughts! 🚀
