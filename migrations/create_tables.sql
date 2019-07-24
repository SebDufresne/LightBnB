CREATE TABLE properties (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  thumbnail_photo_url TEXT,
  cover_photo_url TEXT,
  street TEXT,
  parkings_spaces INTEGER,
  number_of_bathrooms INTEGER,
  number_of_bedrooms INTEGER,
  country TEXT,
  street TEXT,
  city TEXT,
  province TEXT,
  post_code TEXT,
  active BOOLEAN,
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY NOT NULL,
  start_date DATE,
  end_date DATE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT,
  email TEXT,
  password TEXT,
);

CREATE TABLE property_reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  rating INTEGER,
  message TEXT
);

CREATE TABLE guest_reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  rating INTEGER,
  message TEXT
);

CREATE TABLE rates (
  id SERIAL PRIMARY KEY NOT NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  cost_per_night INTEGER,
);