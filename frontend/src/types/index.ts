export interface User {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  email: string;
  phone: string;
  emailVerified?: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  locationType: 'physical' | 'online';
  isPublic: boolean;
  hostId: string;
  hostName: string;
  eventCode: string;
  eventLink: string;
  maxGuests?: number;
  guests: Guest[];
  status: 'upcoming' | 'completed';
  createdAt: string;
}

export interface Guest {
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
