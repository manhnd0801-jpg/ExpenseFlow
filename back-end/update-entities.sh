#!/bin/bash

# Update all entity files to add DateToString decorator
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
  "user.entity.ts"
)

for entity in "${entities[@]}"; do
  file="src/entities/$entity"
  echo "Updating $file..."
  
  # Add DateToString import if not exists
  if ! grep -q "DateToString" "$file"; then
    sed -i '' 's/from '\''..\/common\/decorators'\'';/from '\''..\/common\/decorators'\'';/' "$file"
    sed -i '' 's/import { \([^}]*\) } from '\''..\/common\/decorators'\'';/import { DateToString, \1 } from '\''..\/common\/decorators'\'';/' "$file"
  fi
  
  # Add DateToString decorator to createdAt
  if ! grep -B1 "@CreateDateColumn" "$file" | grep -q "@DateToString"; then
    sed -i '' 's/@CreateDateColumn/@DateToString()\
  @CreateDateColumn/' "$file"
  fi
  
  # Add DateToString decorator to updatedAt
  if ! grep -B1 "@UpdateDateColumn" "$file" | grep -q "@DateToString"; then
    sed -i '' 's/@UpdateDateColumn/@DateToString()\
  @UpdateDateColumn/' "$file"
  fi
done

echo "Done updating entities!"