#!/usr/bin/env python3
import pandas as pd
import json
from datetime import datetime

# Read the Excel file
excel_file = '/Users/vivekanandkoli/finance-manager/Vivek financial planner v3.xlsx'

print("📊 Parsing Vivek's Financial Data...\n")

# Parse Monthly Tracker for expenses
try:
    df_monthly = pd.read_excel(excel_file, sheet_name='🗓️ Monthly Tracker', header=None)
    
    # Find the row with month headers (likely contains Apr, May, Jun, etc.)
    month_row_idx = None
    for idx, row in df_monthly.iterrows():
        row_str = ' '.join([str(x) for x in row if pd.notna(x)])
        if 'Apr' in row_str or 'May' in row_str or 'Jun' in row_str:
            month_row_idx = idx
            break
    
    if month_row_idx:
        print(f"Found month headers at row {month_row_idx}")
        print(f"Headers: {df_monthly.iloc[month_row_idx].tolist()}")
        
        # Extract months
        months = [str(x) if pd.notna(x) else None for x in df_monthly.iloc[month_row_idx]]
        print(f"\nMonths found: {[m for m in months if m and m not in ['nan', 'None']]}")
except Exception as e:
    print(f"Error reading Monthly Tracker: {e}")

print("\n" + "="*80 + "\n")

# Parse MF Portfolio for investments
try:
    df_mf = pd.read_excel(excel_file, sheet_name='📈 MF Portfolio', header=None)
    print("📈 MF Portfolio Preview:")
    print(df_mf.head(15).to_string())
except Exception as e:
    print(f"Error reading MF Portfolio: {e}")

print("\n" + "="*80 + "\n")

# Parse Home Loan Tracker
try:
    df_loan = pd.read_excel(excel_file, sheet_name='🏠 Home Loan Tracker', header=None)
    print("🏠 Home Loan Tracker Preview:")
    print(df_loan.head(15).to_string())
except Exception as e:
    print(f"Error reading Home Loan Tracker: {e}")

print("\n" + "="*80 + "\n")

# Let's try to find actual expense data by looking for currency symbols or numbers
print("🔍 Searching for expense data patterns...\n")

df_monthly = pd.read_excel(excel_file, sheet_name='🗓️ Monthly Tracker', header=None)

# Find rows with category-like text in first few columns and numbers in later columns
expense_rows = []
for idx, row in df_monthly.iterrows():
    # Check if first columns have text and later columns have numbers
    first_col_val = str(row[1]) if pd.notna(row[1]) else ""
    
    # Skip if it's a header or summary row
    if any(skip in first_col_val.lower() for skip in ['total', 'tracker', 'blue =', 'enter', 'month', 'fy 20']):
        continue
    
    # Check if there are numeric values in the row
    numeric_cols = [x for x in row[3:] if isinstance(x, (int, float)) and not pd.isna(x) and x != 0]
    
    if first_col_val and len(numeric_cols) > 0:
        expense_rows.append({
            'row_idx': idx,
            'category': first_col_val,
            'values': row.tolist(),
            'numeric_count': len(numeric_cols)
        })

print(f"Found {len(expense_rows)} potential expense rows")
if len(expense_rows) > 0:
    print("\nFirst 5 expense rows:")
    for i, exp in enumerate(expense_rows[:5]):
        print(f"{i+1}. {exp['category']}: {exp['numeric_count']} values")
        print(f"   Values: {[v for v in exp['values'][3:] if isinstance(v, (int, float)) and not pd.isna(v)][:5]}")
