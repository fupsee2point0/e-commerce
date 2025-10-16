-- This script creates an admin user entry
-- Note: You need to sign up through the admin login page first, then run this script with your user ID

-- Example: Replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users after signing up
-- insert into public.admin_users (id, email, full_name)
-- values ('YOUR_USER_ID_HERE', 'admin@dressvibe.com', 'Admin User')
-- on conflict (id) do nothing;

-- For now, we'll create a function to easily add admin users
create or replace function public.make_user_admin(user_email text, user_full_name text default null)
returns void
language plpgsql
security definer
as $$
declare
  user_id uuid;
begin
  -- Get the user ID from auth.users
  select id into user_id from auth.users where email = user_email;
  
  if user_id is null then
    raise exception 'User with email % not found', user_email;
  end if;
  
  -- Insert into admin_users
  insert into public.admin_users (id, email, full_name)
  values (user_id, user_email, user_full_name)
  on conflict (id) do nothing;
end;
$$;

-- Usage example (uncomment and modify after creating a user):
-- select public.make_user_admin('admin@dressvibe.com', 'Admin User');
