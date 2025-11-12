-- Insert products with generated UUIDs; leave category_id null for now
-- Assumes table public.products has columns matching: id (uuid), category_id (uuid), name, description, price, quantity, image_url, certification, region, created_at, updated_at

insert into public.products (id, category_id, name, description, price, quantity, image_url, certification, region, created_at, updated_at)
values
  (gen_random_uuid(), null, 'Mushroom', '150 gm packet', 70, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Rice Indrayani', '1 kg pack', 100, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Rice Indrayani Cut1', '1 kg pack', 40, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Rice Indrayani crushed', '1 kg pack', 40, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Rice Shakti full', '1 kg', 100, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Rice Shakti Cut', '1 kg', 60, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Rice Shakti Crushed', '1 kg', 40, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Musterd', '250 gm', 100, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Nagali', '1 kg', 120, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Honey', '1 ltr', 1000, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Guava', '1 kg', 100, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Papaya', '1 kg', 40, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Chikoo', '1 kg', 60, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Curry leaves', '1 bundle', 20, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Moringa Leaves', '1 bundle', 20, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Pumpkin', '1 kg', 20, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Lemon grass', '1 bundle', 20, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Lemon', '1 kg', 100, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Milk', '1 ltr', 110, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Ghee', '1 kg', 3000, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Chaas', '1 ltr', 40, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Dhupbatti Chandan', '30 Nos stick', 120, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Dhupbatti Lobhan', '30 Nos stick', 120, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Dhupbatti Havan', '30 Nos stick', 100, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Dhupbatti Mosquito repellent', '30 nos stick', 100, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Cow Dung Powder', '1 kg pack', 50, 0, null, null, 'Nareshwadi', now(), now()),
  (gen_random_uuid(), null, 'Cow Dung Cake', 'Pack of 10 Nos.', 50, 0, null, null, 'Nareshwadi', now(), now());
