
-- Add new columns to customers table
ALTER TABLE public.customers 
ADD COLUMN customer_number TEXT,
ADD COLUMN plan TEXT CHECK (plan IN ('Enterprise (USD)', 'Growth (USD+5%)')),
ADD COLUMN email TEXT,
ADD COLUMN opening_credit NUMERIC DEFAULT 0,
ADD COLUMN current_credit NUMERIC DEFAULT 0;

-- Create index for customer number for faster lookups
CREATE INDEX idx_customers_customer_number ON public.customers(customer_number);
