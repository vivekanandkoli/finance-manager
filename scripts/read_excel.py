#!/usr/bin/env python3
import pandas as pd
import json
import sys

try:
    # Read Excel file
    excel_file = '/Users/vivekanandkoli/finance-manager/Vivek financial planner v3.xlsx'
    xl = pd.ExcelFile(excel_file)
    
    print(f"📊 Reading Excel file: {excel_file}\n")
    print(f"Found {len(xl.sheet_names)} sheets: {xl.sheet_names}\n")
    print("=" * 80)
    
    all_data = {}
    
    for sheet_name in xl.sheet_names:
        print(f"\n📄 Sheet: {sheet_name}")
        print("-" * 80)
        
        df = pd.read_excel(xl, sheet_name=sheet_name)
        
        print(f"Rows: {len(df)}")
        print(f"Columns: {list(df.columns)}")
        
        if len(df) > 0:
            print(f"\nFirst 3 rows:")
            print(df.head(3).to_string())
        
        # Convert to JSON-serializable format
        data = df.to_dict(orient='records')
        
        # Convert NaN and NaT to None
        for row in data:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
                elif isinstance(value, pd.Timestamp):
                    row[key] = value.strftime('%Y-%m-%d')
        
        all_data[sheet_name] = data
    
    # Save to JSON
    output_file = '/Users/vivekanandkoli/finance-manager/nri-wallet/vivek_data_parsed.json'
    with open(output_file, 'w') as f:
        json.dump(all_data, f, indent=2, default=str)
    
    print("\n\n" + "=" * 80)
    print(f"✅ Data saved to: {output_file}")
    print("\nSummary:")
    for sheet_name, data in all_data.items():
        print(f"  - {sheet_name}: {len(data)} rows")
    
except Exception as e:
    print(f"❌ Error: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
