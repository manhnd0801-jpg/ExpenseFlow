#!/bin/bash

echo "Fixing DateToString imports in entities..."

# List of all entity files
entities=(
  "debt.entity.ts"
  "debt-payment.entity.ts" 
  "event.entity.ts"
  "goal.entity.ts"
  "loan.entity.ts"
  "loan-payment.entity.ts"
  "notification.entity.ts"
  "recurring-transaction.entity.ts"
  "reminder.entity.ts"
  "shared-book.entity.ts"
  "shared-book-member.entity.ts"
)

for entity in "${entities[@]}"; do
  file="src/entities/$entity"
  echo "Processing $file..."
  
  # Check if file exists
  if [[ ! -f "$file" ]]; then
    echo "File $file not found, skipping..."
    continue
  fi
  
  # Check if DateToString import already exists
  if grep -q "DateToString" "$file"; then
    echo "DateToString already imported in $file"
    
    # Check if import is correct - if not, fix it
    if ! grep -q "import.*DateToString.*from.*decorators" "$file"; then
      echo "Fixing DateToString import in $file..."
      # Add import after decorators import or create one
      if grep -q "from '../common/decorators'" "$file"; then
        # Update existing decorator import
        sed -i '' "s/import { \([^}]*\) } from '..\/common\/decorators'/import { DateToString, \1 } from '..\/common\/decorators'/" "$file"
      else
        # Add new import line after enum imports  
        sed -i '' "/from '..\/common\/constants\/enums'/a\\
import { DateToString } from '../common/decorators';" "$file"
      fi
    fi
  else
    echo "Adding DateToString import to $file..."
    # Add import after enum imports
    sed -i '' "/from '..\/common\/constants\/enums'/a\\
import { DateToString } from '../common/decorators';" "$file"
  fi
done

echo "All entities processed!"