-- Add M-Pesa specific columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS merchant_request_id TEXT,
ADD COLUMN IF NOT EXISTS checkout_request_id TEXT,
ADD COLUMN IF NOT EXISTS mpesa_receipt_number TEXT,
ADD COLUMN IF NOT EXISTS mpesa_transaction_date TEXT,
ADD COLUMN IF NOT EXISTS mpesa_phone_number TEXT,
ADD COLUMN IF NOT EXISTS mpesa_result_desc TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_request_id ON public.transactions(merchant_request_id);
CREATE INDEX IF NOT EXISTS idx_transactions_checkout_request_id ON public.transactions(checkout_request_id);