BEGIN;

-- Demo-only seller accounts. Authentication is intentionally not implemented yet.
INSERT INTO users (name, email, password, role)
VALUES
  ('Mina Okafor', 'mina@example.marketly.test', 'demo-seed-password-not-for-login', 'seller'),
  ('Common Thread Studio', 'common-thread@example.marketly.test', 'demo-seed-password-not-for-login', 'seller'),
  ('Juniper & Co.', 'juniper@example.marketly.test', 'demo-seed-password-not-for-login', 'seller'),
  ('Paper Moon Press', 'paper-moon@example.marketly.test', 'demo-seed-password-not-for-login', 'seller'),
  ('Good Table Pantry', 'good-table@example.marketly.test', 'demo-seed-password-not-for-login', 'seller')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role;

INSERT INTO categories (name, description)
VALUES
  ('Home & Objects', 'Useful, tactile pieces for the rooms and rituals you return to.'),
  ('Wear & Carry', 'Everyday pieces made to move with you.'),
  ('Paper & Print', 'Small-run art and paper goods with a point of view.'),
  ('Pantry', 'Thoughtful ingredients and pantry staples for everyday tables.')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO sellers (user_id, store_name, description)
SELECT u.id, seed.store_name, seed.description
FROM (
  VALUES
    ('mina@example.marketly.test', 'Mina Okafor Ceramics', 'Small-batch ceramics shaped and glazed by hand in Chicago.'),
    ('common-thread@example.marketly.test', 'Common Thread Studio', 'Quiet, useful textiles made in small runs in Portland.'),
    ('juniper@example.marketly.test', 'Juniper & Co.', 'Atmospheric candles and objects for slower evenings.'),
    ('paper-moon@example.marketly.test', 'Paper Moon Press', 'Colorful prints and paper goods for lived-in walls and desks.'),
    ('good-table@example.marketly.test', 'Good Table Pantry', 'Bright, generous pantry staples for everyday cooking.')
) AS seed(email, store_name, description)
JOIN users AS u ON u.email = seed.email
ON CONFLICT (user_id) DO UPDATE
SET store_name = EXCLUDED.store_name,
    description = EXCLUDED.description;

INSERT INTO products (
  seller_id,
  category_id,
  name,
  description,
  price,
  image,
  stock
)
SELECT
  s.id,
  c.id,
  seed.name,
  seed.description,
  seed.price,
  seed.image,
  seed.stock
FROM (
  VALUES
    ('Mina Okafor Ceramics', 'Home & Objects', 'Speckled Morning Mug', 'A generous hand-thrown mug with a warm ivory glaze and a quiet flecked finish.', 28.00, '/product-images/speckled-morning-mug.jpg', 14),
    ('Common Thread Studio', 'Wear & Carry', 'Sage Linen Carryall', 'A sturdy, soft-washed linen tote with room for market mornings and library afternoons.', 64.00, '/product-images/sage-linen-carryall.jpg', 8),
    ('Juniper & Co.', 'Home & Objects', 'Wild Fig Candle', 'A slow-burning soy candle with fig, cedar, and a little green brightness.', 32.00, '/product-images/wild-fig-candle.jpg', 22),
    ('Paper Moon Press', 'Paper & Print', 'Sunroom Art Print', 'A limited-run risograph print in terracotta, evergreen, and butter yellow.', 42.00, '/product-images/sunroom-art-print.jpg', 11),
    ('Good Table Pantry', 'Pantry', 'Rosemary Sea Salt', 'Flaky sea salt finished with fragrant rosemary for eggs, tomatoes, and roast vegetables.', 16.00, '/product-images/rosemary-sea-salt.jpg', 30),
    ('Common Thread Studio', 'Home & Objects', 'Rattan Market Basket', 'A handwoven basket with a rounded handle for produce, linens, or a day at the beach.', 78.00, '/product-images/rattan-market-basket.jpg', 5)
) AS seed(seller_name, category_name, name, description, price, image, stock)
JOIN sellers AS s ON s.store_name = seed.seller_name
JOIN categories AS c ON c.name = seed.category_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products AS existing
  WHERE existing.seller_id = s.id
    AND existing.name = seed.name
);

COMMIT;