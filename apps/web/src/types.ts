export type Role = 'customer' | 'support';

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export type Trip = {
  id: string;
  title: string;
  destination: string;
  description: string;
  departure_date: string;
  return_date: string;
  price_cents: number;
  seats_available: number;
  image_key: string;
};

export type Booking = {
  id: string;
  reference: string;
  title: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  travelers: number;
  total_cents: number;
  status: string;
  payment_status?: string;
  card_last4?: string;
  itinerary_notes?: string;
  traveler_name?: string;
  traveler_email?: string;
  trip_description?: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  support_reply?: string;
  email?: string;
  booking_reference?: string;
};

export type AuditEvent = {
  id: number;
  action: string;
  entity_type: string;
  entity_id?: string;
  email?: string;
  created_at: string;
};

export type TravelerProfile = {
  phone?: string;
  birthDate?: string;
  nationality?: string;
  passportNumber?: string;
};

export type View = 'discover' | 'bookings' | 'profile' | 'support' | 'audit';

export type AuthSubmission = {
  fullName?: string;
  email: string;
  password: string;
};
