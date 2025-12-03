#!/bin/bash

# Script to fix paid-off loans that still have ACTIVE status
# This will update loans where remainingPrincipal <= 0 or remainingMonths <= 0

echo "========================================"
echo "Fix Paid-Off Loans Status"
echo "========================================"
echo ""

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-expenseflow}
DB_USER=${DB_USER:-expenseflow}

# Get database password
if [ -z "$DB_PASSWORD" ]; then
    echo "Please enter database password:"
    read -s DB_PASSWORD
    export PGPASSWORD=$DB_PASSWORD
fi

echo "Connecting to database: $DB_NAME@$DB_HOST:$DB_PORT"
echo ""

# Run the SQL script
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f fix-paid-off-loans-status.sql

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ Successfully updated paid-off loans!"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "❌ Failed to update loans. Check errors above."
    echo "========================================"
    exit 1
fi

# Unset password
unset PGPASSWORD
