-- Insert sample products for Gents - Shirts
do $$
declare
  gents_category_id uuid;
  shirts_subcategory_id uuid;
  product_id uuid;
begin
  select id into gents_category_id from public.categories where slug = 'gents';
  select id into shirts_subcategory_id from public.subcategories where slug = 'shirts' and category_id = gents_category_id;

  -- Product 1: Classic White Shirt
  insert into public.products (name, slug, description, base_price, category_id, subcategory_id)
  values (
    'Classic White Dress Shirt',
    'classic-white-dress-shirt',
    'Timeless white dress shirt perfect for formal occasions. Made from premium cotton with a comfortable fit.',
    2499.00,
    gents_category_id,
    shirts_subcategory_id
  )
  returning id into product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order)
  values 
    (product_id, '/placeholder.svg?height=600&width=600', 'Classic white dress shirt front view', 1),
    (product_id, '/placeholder.svg?height=600&width=600', 'Classic white dress shirt detail', 2);

  insert into public.product_variants (product_id, size, color, stock_quantity, sku)
  values
    (product_id, 'S', 'White', 15, 'CWDS-S-WHT'),
    (product_id, 'M', 'White', 20, 'CWDS-M-WHT'),
    (product_id, 'L', 'White', 18, 'CWDS-L-WHT'),
    (product_id, 'XL', 'White', 12, 'CWDS-XL-WHT');

  -- Product 2: Blue Oxford Shirt
  insert into public.products (name, slug, description, base_price, category_id, subcategory_id)
  values (
    'Blue Oxford Shirt',
    'blue-oxford-shirt',
    'Versatile blue oxford shirt suitable for both casual and business settings. Breathable fabric for all-day comfort.',
    2199.00,
    gents_category_id,
    shirts_subcategory_id
  )
  returning id into product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order)
  values 
    (product_id, '/placeholder.svg?height=600&width=600', 'Blue oxford shirt', 1);

  insert into public.product_variants (product_id, size, color, stock_quantity, sku)
  values
    (product_id, 'S', 'Blue', 10, 'BOS-S-BLU'),
    (product_id, 'M', 'Blue', 15, 'BOS-M-BLU'),
    (product_id, 'L', 'Blue', 12, 'BOS-L-BLU'),
    (product_id, 'XL', 'Blue', 8, 'BOS-XL-BLU');
end $$;

-- Insert sample products for Ladies - Dresses
do $$
declare
  ladies_category_id uuid;
  dresses_subcategory_id uuid;
  product_id uuid;
begin
  select id into ladies_category_id from public.categories where slug = 'ladies';
  select id into dresses_subcategory_id from public.subcategories where slug = 'dresses' and category_id = ladies_category_id;

  -- Product 3: Floral Summer Dress
  insert into public.products (name, slug, description, base_price, category_id, subcategory_id)
  values (
    'Floral Summer Dress',
    'floral-summer-dress',
    'Light and breezy floral dress perfect for summer days. Features a flattering A-line silhouette.',
    3299.00,
    ladies_category_id,
    dresses_subcategory_id
  )
  returning id into product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order)
  values 
    (product_id, '/placeholder.svg?height=600&width=600', 'Floral summer dress', 1),
    (product_id, '/placeholder.svg?height=600&width=600', 'Floral dress detail', 2);

  insert into public.product_variants (product_id, size, color, stock_quantity, sku)
  values
    (product_id, 'XS', 'Floral', 8, 'FSD-XS-FLR'),
    (product_id, 'S', 'Floral', 12, 'FSD-S-FLR'),
    (product_id, 'M', 'Floral', 15, 'FSD-M-FLR'),
    (product_id, 'L', 'Floral', 10, 'FSD-L-FLR');

  -- Product 4: Black Evening Dress
  insert into public.products (name, slug, description, base_price, category_id, subcategory_id)
  values (
    'Elegant Black Evening Dress',
    'elegant-black-evening-dress',
    'Sophisticated black evening dress for special occasions. Timeless design with modern touches.',
    4999.00,
    ladies_category_id,
    dresses_subcategory_id
  )
  returning id into product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order)
  values 
    (product_id, '/placeholder.svg?height=600&width=600', 'Black evening dress', 1);

  insert into public.product_variants (product_id, size, color, stock_quantity, sku)
  values
    (product_id, 'XS', 'Black', 5, 'BED-XS-BLK'),
    (product_id, 'S', 'Black', 8, 'BED-S-BLK'),
    (product_id, 'M', 'Black', 10, 'BED-M-BLK'),
    (product_id, 'L', 'Black', 6, 'BED-L-BLK');
end $$;

-- Insert sample products for Gents - T-Shirts
do $$
declare
  gents_category_id uuid;
  tshirts_subcategory_id uuid;
  product_id uuid;
begin
  select id into gents_category_id from public.categories where slug = 'gents';
  select id into tshirts_subcategory_id from public.subcategories where slug = 't-shirts' and category_id = gents_category_id;

  -- Product 5: Basic Cotton T-Shirt
  insert into public.products (name, slug, description, base_price, category_id, subcategory_id)
  values (
    'Premium Cotton T-Shirt',
    'premium-cotton-tshirt',
    'Soft and comfortable cotton t-shirt. Available in multiple colors. Perfect for everyday wear.',
    899.00,
    gents_category_id,
    tshirts_subcategory_id
  )
  returning id into product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order)
  values 
    (product_id, '/placeholder.svg?height=600&width=600', 'Premium cotton t-shirt', 1);

  insert into public.product_variants (product_id, size, color, stock_quantity, sku)
  values
    (product_id, 'S', 'Black', 20, 'PCT-S-BLK'),
    (product_id, 'M', 'Black', 25, 'PCT-M-BLK'),
    (product_id, 'L', 'Black', 22, 'PCT-L-BLK'),
    (product_id, 'XL', 'Black', 15, 'PCT-XL-BLK'),
    (product_id, 'S', 'White', 18, 'PCT-S-WHT'),
    (product_id, 'M', 'White', 23, 'PCT-M-WHT'),
    (product_id, 'L', 'White', 20, 'PCT-L-WHT'),
    (product_id, 'XL', 'White', 12, 'PCT-XL-WHT'),
    (product_id, 'S', 'Navy', 15, 'PCT-S-NVY'),
    (product_id, 'M', 'Navy', 20, 'PCT-M-NVY'),
    (product_id, 'L', 'Navy', 18, 'PCT-L-NVY'),
    (product_id, 'XL', 'Navy', 10, 'PCT-XL-NVY');
end $$;

-- Insert sample products for Bags & Shoes
do $$
declare
  bags_shoes_category_id uuid;
  mens_bags_subcategory_id uuid;
  womens_shoes_subcategory_id uuid;
  product_id uuid;
begin
  select id into bags_shoes_category_id from public.categories where slug = 'bags-shoes';
  select id into mens_bags_subcategory_id from public.subcategories where slug = 'mens-bags' and category_id = bags_shoes_category_id;
  select id into womens_shoes_subcategory_id from public.subcategories where slug = 'womens-shoes' and category_id = bags_shoes_category_id;

  -- Product 6: Leather Messenger Bag
  insert into public.products (name, slug, description, base_price, category_id, subcategory_id)
  values (
    'Leather Messenger Bag',
    'leather-messenger-bag',
    'Professional leather messenger bag with multiple compartments. Perfect for work or travel.',
    5999.00,
    bags_shoes_category_id,
    mens_bags_subcategory_id
  )
  returning id into product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order)
  values 
    (product_id, '/placeholder.svg?height=600&width=600', 'Leather messenger bag', 1);

  insert into public.product_variants (product_id, size, color, stock_quantity, sku)
  values
    (product_id, 'One Size', 'Brown', 10, 'LMB-OS-BRN'),
    (product_id, 'One Size', 'Black', 12, 'LMB-OS-BLK');

  -- Product 7: Women's Ankle Boots
  insert into public.products (name, slug, description, base_price, category_id, subcategory_id)
  values (
    'Classic Ankle Boots',
    'classic-ankle-boots',
    'Stylish ankle boots with comfortable heel. Perfect for any season.',
    3799.00,
    bags_shoes_category_id,
    womens_shoes_subcategory_id
  )
  returning id into product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order)
  values 
    (product_id, '/placeholder.svg?height=600&width=600', 'Classic ankle boots', 1);

  insert into public.product_variants (product_id, size, color, stock_quantity, sku)
  values
    (product_id, '36', 'Black', 8, 'CAB-36-BLK'),
    (product_id, '37', 'Black', 10, 'CAB-37-BLK'),
    (product_id, '38', 'Black', 12, 'CAB-38-BLK'),
    (product_id, '39', 'Black', 10, 'CAB-39-BLK'),
    (product_id, '40', 'Black', 6, 'CAB-40-BLK');
end $$;
