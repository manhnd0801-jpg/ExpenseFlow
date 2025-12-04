-- Round all existing amounts in database to remove decimals

-- Round transaction amounts
UPDATE transactions 
SET amount = ROUND(amount)
WHERE amount != ROUND(amount);

-- Round account balances
UPDATE accounts 
SET balance = ROUND(balance)
WHERE balance != ROUND(balance);

-- Round loan amounts
UPDATE loans 
SET 
  original_amount = ROUND(original_amount),
  remaining_principal = ROUND(remaining_principal),
  monthly_payment = ROUND(monthly_payment),
  total_paid = ROUND(total_paid),
  total_interest_paid = ROUND(total_interest_paid),
  total_prepayment = ROUND(total_prepayment)
WHERE 
  original_amount != ROUND(original_amount) OR
  remaining_principal != ROUND(remaining_principal) OR
  monthly_payment != ROUND(monthly_payment) OR
  total_paid != ROUND(total_paid) OR
  total_interest_paid != ROUND(total_interest_paid) OR
  total_prepayment != ROUND(total_prepayment);

-- Round loan payment amounts
UPDATE loan_payments 
SET 
  amount = ROUND(amount),
  principal_amount = ROUND(principal_amount),
  interest_amount = ROUND(interest_amount)
WHERE 
  amount != ROUND(amount) OR
  principal_amount != ROUND(principal_amount) OR
  interest_amount != ROUND(interest_amount);

-- Round goal amounts
UPDATE goals 
SET 
  target_amount = ROUND(target_amount),
  current_amount = ROUND(current_amount)
WHERE 
  target_amount != ROUND(target_amount) OR
  current_amount != ROUND(current_amount);

-- Round goal transaction amounts
UPDATE goal_transactions 
SET amount = ROUND(amount)
WHERE amount != ROUND(amount);

-- Round debt amounts
UPDATE debts 
SET 
  original_amount = ROUND(original_amount),
  remaining_amount = ROUND(remaining_amount),
  total_paid = ROUND(total_paid)
WHERE 
  original_amount != ROUND(original_amount) OR
  remaining_amount != ROUND(remaining_amount) OR
  total_paid != ROUND(total_paid);

-- Round debt payment amounts
UPDATE debt_payments 
SET amount = ROUND(amount)
WHERE amount != ROUND(amount);

-- Round budget amounts
UPDATE budgets 
SET 
  amount = ROUND(amount),
  spent = ROUND(spent)
WHERE 
  amount != ROUND(amount) OR
  spent != ROUND(spent);

-- Round event budgets
UPDATE events 
SET budget = ROUND(budget)
WHERE budget != ROUND(budget) AND budget IS NOT NULL;

-- Round recurring transaction amounts
UPDATE recurring_transactions 
SET amount = ROUND(amount)
WHERE amount != ROUND(amount);

SELECT 'Database amounts have been rounded to remove decimals' AS result;
