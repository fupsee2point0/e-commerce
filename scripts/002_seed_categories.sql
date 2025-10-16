-- Insert main categories
insert into public.categories (name, slug, description) values
  ('Gents', 'gents', 'Men''s clothing and accessories'),
  ('Ladies', 'ladies', 'Women''s clothing and accessories'),
  ('Babies', 'babies', 'Baby clothing and accessories'),
  ('Bags & Shoes', 'bags-shoes', 'Bags and shoes for all')
on conflict (slug) do nothing;

-- Insert subcategories for Gents
insert into public.subcategories (category_id, name, slug)
select id, 'Shirts', 'shirts' from public.categories where slug = 'gents'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'T-Shirts', 't-shirts' from public.categories where slug = 'gents'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Pants', 'pants' from public.categories where slug = 'gents'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Winter Clothing', 'winter-clothing' from public.categories where slug = 'gents'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Other Gents'' Clothing', 'other' from public.categories where slug = 'gents'
on conflict (category_id, slug) do nothing;

-- Insert subcategories for Ladies
insert into public.subcategories (category_id, name, slug)
select id, 'Dresses', 'dresses' from public.categories where slug = 'ladies'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Tops', 'tops' from public.categories where slug = 'ladies'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Winter Clothing', 'winter-clothing' from public.categories where slug = 'ladies'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Other Women''s Clothing', 'other' from public.categories where slug = 'ladies'
on conflict (category_id, slug) do nothing;

-- Insert subcategories for Babies
insert into public.subcategories (category_id, name, slug)
select id, 'Clothing', 'clothing' from public.categories where slug = 'babies'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Accessories', 'accessories' from public.categories where slug = 'babies'
on conflict (category_id, slug) do nothing;

-- Insert subcategories for Bags & Shoes
insert into public.subcategories (category_id, name, slug)
select id, 'Men''s Bags', 'mens-bags' from public.categories where slug = 'bags-shoes'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Women''s Bags', 'womens-bags' from public.categories where slug = 'bags-shoes'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Baby Bags', 'baby-bags' from public.categories where slug = 'bags-shoes'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Men''s Shoes', 'mens-shoes' from public.categories where slug = 'bags-shoes'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Women''s Shoes', 'womens-shoes' from public.categories where slug = 'bags-shoes'
on conflict (category_id, slug) do nothing;

insert into public.subcategories (category_id, name, slug)
select id, 'Baby Shoes', 'baby-shoes' from public.categories where slug = 'bags-shoes'
on conflict (category_id, slug) do nothing;
