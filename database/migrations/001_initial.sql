CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('customer', 'support');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('approved', 'declined');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'closed');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL CHECK (email = lower(email)),
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE TABLE traveler_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone text,
  birth_date date,
  nationality text,
  passport_ciphertext text,
  passport_iv text,
  passport_tag text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  destination text NOT NULL,
  description text NOT NULL,
  departure_date date NOT NULL,
  return_date date NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents > 0),
  seats_available integer NOT NULL CHECK (seats_available >= 0),
  image_key text NOT NULL,
  is_published boolean NOT NULL DEFAULT true
);

CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL CHECK (code = upper(code)),
  discount_percent integer NOT NULL CHECK (discount_percent BETWEEN 1 AND 80),
  minimum_cents integer NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  max_uses integer NOT NULL CHECK (max_uses > 0),
  uses integer NOT NULL DEFAULT 0 CHECK (uses >= 0)
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  trip_id uuid NOT NULL REFERENCES trips(id),
  coupon_id uuid REFERENCES coupons(id),
  travelers integer NOT NULL CHECK (travelers BETWEEN 1 AND 8),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  itinerary_notes text NOT NULL DEFAULT 'Votre itinéraire détaillé sera disponible prochainement.',
  status booking_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE NOT NULL REFERENCES bookings(id),
  provider_reference text UNIQUE NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  card_last4 char(4) NOT NULL,
  status payment_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  booking_id uuid REFERENCES bookings(id),
  subject text NOT NULL,
  message text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  support_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_audit_created ON audit_events(created_at DESC);
CREATE INDEX idx_trips_search ON trips USING gin (to_tsvector('simple', title || ' ' || destination || ' ' || description));
