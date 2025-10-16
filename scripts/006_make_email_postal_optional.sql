-- Make customer_email and shipping_postal_code optional in orders table
-- This allows users to checkout without providing email or postal code

alter table public.orders 
  alter column customer_email drop not null;

alter table public.orders 
  alter column shipping_postal_code drop not null;
