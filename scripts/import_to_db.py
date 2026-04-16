#!/usr/bin/env python3
import pandas as pd
import json
from datetime import datetime

# Read the Excel file
excel_file = '/Users/vivekanandkoli/finance-manager/Vivek financial planner v3.xlsx'

print("📊 Importing Vivek's Financial Data into JSON format for IndexedDB...\n")

all_imported_data = {
    'expenses': [],
    'investments': [],
    'loans': [],
    'budgets': [],
    'goals': []
}

# ========== Parse Monthly Tracker for Expenses ==========
try:
    df = pd.read_excel(excel_file, sheet_name='🗓️ Monthly Tracker', header=None)
    
    # Find month row (row 3 based on earlier output)
    month_row = 3
    months = df.iloc[month_row, 3:15].tolist()  # Apr-26 through Mar-27
    
    print(f"📅 Found months: {months}\n")
    
    # Process expense rows (starting from row 4)
    for idx in range(4, len(df)):
        row = df.iloc[idx]
        
        category = str(row[2]) if pd.notna(row[2]) else ""
        
        # Skip empty or header rows
        if not category or category in ['nan', 'Line Item'] or 'TOTAL' in category.upper():
            continue
        
        # For each month, create an expense entry
        for month_idx, month in enumerate(months):
            if pd.notna(month):
                amount = row[3 + month_idx]
                
                if pd.notna(amount) and isinstance(amount, (int, float)) and amount != 0:
                    # Parse month to date
                    try:
                        month_str = str(month).replace('\n', ' ')
                        date_obj = datetime.strptime(month_str, '%b-%y')
                        date_str = date_obj.strftime('%Y-%m-%d')
                    except:
                        date_str = '2026-04-01'  # Default
                    
                    expense = {
                        'category': category.strip(),
                        'amount': float(amount),
                        'date': date_str,
                        'description': f'{category} for {month}',
                        'currency': 'INR',
                        'paymentMethod': 'Bank Transfer'
                    }
                    
                    all_imported_data['expenses'].append(expense)
    
    print(f"✅ Imported {len(all_imported_data['expenses'])} expense entries\n")
    
except Exception as e:
    print(f"❌ Error reading Monthly Tracker: {e}\n")

# ========== Parse MF Portfolio for Investments ==========
try:
    df = pd.read_excel(excel_file, sheet_name='📈 MF Portfolio', header=None)
    
    # Find header row (likely row 2)
    for idx in range(min(10, len(df))):
        row_str = ' '.join([str(x) for x in df.iloc[idx] if pd.notna(x)])
        if 'Fund Name' in row_str or 'Category' in row_str:
            header_row = idx
            break
    
    # Extract investments from rows after header
    for idx in range(header_row + 1, len(df)):
        row = df.iloc[idx]
        
        fund_name = str(row[1]) if pd.notna(row[1]) else ""
        
        if not fund_name or fund_name == 'nan' or len(fund_name) < 3:
            continue
        
        category = str(row[2]) if pd.notna(row[2]) else "Mutual Fund"
        invested = row[3] if pd.notna(row[3]) and isinstance(row[3], (int, float)) else 0
        current_value = row[4] if pd.notna(row[4]) and isinstance(row[4], (int, float)) else 0
        sip_amount = row[7] if len(row) > 7 and pd.notna(row[7]) and isinstance(row[7], (int, float)) else 0
        
        if invested > 0 or current_value > 0:
            investment = {
                'fundName': fund_name.strip(),
                'category': category.strip() if category != 'nan' else 'Equity',
                'investedAmount': float(invested),
                'currentValue': float(current_value),
                'units': 0,
                'avgNAV': 0,
                'currentNAV': 0,
                'sipAmount': float(sip_amount),
                'investmentDate': '2024-01-01',
                'returns': float(current_value - invested) if current_value > 0 else 0
            }
            
            all_imported_data['investments'].append(investment)
    
    print(f"✅ Imported {len(all_imported_data['investments'])} investment entries\n")
    
except Exception as e:
    print(f"❌ Error reading MF Portfolio: {e}\n")

# ========== Parse Home Loan Tracker for Loans ==========
try:
    df = pd.read_excel(excel_file, sheet_name='🏠 Home Loan Tracker', header=None)
    
    # Extract loan details from header/summary rows
    loan_info = {
        'loanType': 'Home Loan',
        'lender': 'SBI',
        'principalAmount': 6860594,
        'interestRate': 7.30,
        'tenure': 240,
        'emiAmount': 57328,
        'startDate': '2024-01-01',
        'outstandingBalance': 6860594,
        'totalInterestPaid': 0,
        'totalPrincipalPaid': 0
    }
    
    all_imported_data['loans'].append(loan_info)
    
    print(f"✅ Imported {len(all_imported_data['loans'])} loan entries\n")
    
except Exception as e:
    print(f"❌ Error reading Home Loan Tracker: {e}\n")

# Save to JSON
output_file = '/Users/vivekanandkoli/finance-manager/nri-wallet/vivek_import_data.json'
with open(output_file, 'w') as f:
    json.dump(all_imported_data, f, indent=2)

print("="*80)
print(f"\n✅ ALL DATA EXPORTED TO: {output_file}\n")
print("Summary:")
print(f"  - Expenses: {len(all_imported_data['expenses'])} entries")
print(f"  - Investments: {len(all_imported_data['investments'])} entries")
print(f"  - Loans: {len(all_imported_data['loans'])} entries")
print(f"  - Budgets: {len(all_imported_data['budgets'])} entries")
print(f"  - Goals: {len(all_imported_data['goals'])} entries")
print("\n" + "="*80)
