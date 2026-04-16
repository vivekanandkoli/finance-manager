#!/bin/bash

# Script to remove all demo/mock data from NRI SaaS app
# Run from nri-saas directory: bash scripts/clean-demo-data.sh

echo "🧹 Cleaning demo data from all pages..."

# List of files with demo data
FILES_TO_CLEAN=(
  "app/(dashboard)/expenses/page.tsx"
  "app/(dashboard)/income/page.tsx"
  "app/(dashboard)/bills/page.tsx"
  "app/(dashboard)/budgets/page.tsx"
  "app/(dashboard)/loans/page.tsx"
  "app/(dashboard)/deposits/page.tsx"
  "app/(dashboard)/investments/page.tsx"
)

# Backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backups in $BACKUP_DIR..."
for file in "${FILES_TO_CLEAN[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/$(basename $file)"
    echo "  ✓ Backed up: $file"
  fi
done

echo ""
echo "✅ Backups created!"
echo "⚠️  Note: This script creates backups but manual cleanup is recommended"
echo ""
echo "Files with demo data:"
for file in "${FILES_TO_CLEAN[@]}"; do
  echo "  - $file"
done

echo ""
echo "Please review and clean these files manually or use the Claude AI assistant."
