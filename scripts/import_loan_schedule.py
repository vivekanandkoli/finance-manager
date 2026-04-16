#!/usr/bin/env python3
import pandas as pd
import json
from datetime import datetime

excel_file = '/Users/vivekanandkoli/finance-manager/Vivek financial planner v3.xlsx'

print("🏠 EXTRACTING HOME LOAN AMORTIZATION SCHEDULE\n")

# Read Home Loan sheet
df_loan = pd.read_excel(excel_file, sheet_name='🏠 Home Loan Tracker', header=None)

# Row 34 has the first amortization data row (Month 1)
# Columns: Month #, Date, Opening Balance, EMI, Interest, Principal, Prepayment, Closing Balance, Status

loan_schedule = []

# Start from row 34 (first data row after header)
for idx in range(34, min(34 + 269, len(df_loan))):  # 269 remaining months
    row = df_loan.iloc[idx]
    
    # Check if this is a valid data row
    if pd.notna(row[2]) and isinstance(row[2], str) and '-' in str(row[2]):  # Has date
        try:
            payment_entry = {
                'month_number': int(row[1]) if pd.notna(row[1]) else idx - 33,
                'payment_date': str(row[2]),
                'opening_balance': float(row[3]) if pd.notna(row[3]) else 0,
                'emi_amount': float(row[4]) if pd.notna(row[4]) else 0,
                'interest_paid': float(row[5]) if pd.notna(row[5]) else 0,
                'principal_paid': float(row[6]) if pd.notna(row[6]) else 0,
                'prepayment': float(row[7]) if pd.notna(row[7]) else 0,
                'closing_balance': float(row[8]) if pd.notna(row[8]) else 0,
                'status': str(row[9]) if pd.notna(row[9]) else '⏳ Pending'
            }
            loan_schedule.append(payment_entry)
        except (ValueError, TypeError) as e:
            continue

# Extract loan details from early rows
loan_details = {
    'loanType': 'Home Loan',
    'lender': 'SBI',
    'sanctionedAmount': 7422750,
    'outstandingBalance': 6860594,
    'principalRepaid': 562156,
    'interestRate': 7.30,
    'monthlyEMI': 57328,
    'remainingTenure': 269,
    'startDate': 'Jan-2021',
    'currency': 'INR',
    'amortization_schedule': loan_schedule
}

# Save to JSON
output_file = '/Users/vivekanandkoli/finance-manager/nri-wallet/public/loan_schedule.json'
with open(output_file, 'w') as f:
    json.dump(loan_details, f, indent=2)

print(f"✅ Extracted {len(loan_schedule)} monthly payment entries")
print(f"📊 Loan Details:")
print(f"   - Sanctioned Amount: ₹{loan_details['sanctionedAmount']:,}")
print(f"   - Outstanding Balance: ₹{loan_details['outstandingBalance']:,}")
print(f"   - EMI: ₹{loan_details['monthlyEMI']:,}")
print(f"   - Interest Rate: {loan_details['interestRate']}%")
print(f"   - Remaining Tenure: {loan_details['remainingTenure']} months")
print(f"\n✅ Saved to: {output_file}")

# Show first 5 and last 5 entries
print("\n📅 First 5 payments:")
for entry in loan_schedule[:5]:
    print(f"   Month {entry['month_number']}: {entry['payment_date']} - EMI ₹{entry['emi_amount']:,.0f}, Principal ₹{entry['principal_paid']:,.0f}, Interest ₹{entry['interest_paid']:,.0f}")

print("\n📅 Last 5 payments:")
for entry in loan_schedule[-5:]:
    print(f"   Month {entry['month_number']}: {entry['payment_date']} - EMI ₹{entry['emi_amount']:,.0f}, Principal ₹{entry['principal_paid']:,.0f}, Interest ₹{entry['interest_paid']:,.0f}")
