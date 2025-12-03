-- Add payment_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN payment_id UUID NULL;

-- Add foreign key constraint (optional, for data integrity)
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_payment
FOREIGN KEY (payment_id) 
REFERENCES loan_payments(id) 
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);

-- Add comment
COMMENT ON COLUMN transactions.payment_id IS 'References loan_payments.id if this transaction was created from a loan payment';
