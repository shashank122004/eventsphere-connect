import { Event, Contact, Guest } from '@/types';

const EVENTS_KEY = 'eventify_events';
const CONTACTS_KEY = 'eventify_contacts';

// Event Storage
export const getEvents = (): Event[] => {
  const stored = localStorage.getItem(EVENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveEvents = (events: Event[]) => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
};

export const createEvent = (event: Omit<Event, 'id' | 'eventCode' | 'eventLink' | 'guests' | 'status' | 'createdAt'>): Event => {
  const events = getEvents();
  const eventCode = generateEventCode();
  const newEvent: Event = {
    ...event,
    id: crypto.randomUUID(),
    eventCode,
    eventLink: `${window.location.origin}/join?code=${eventCode}`,
    guests: [],
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  };
  saveEvents([...events, newEvent]);
  return newEvent;
};

export const getEventByCode = (code: string): Event | undefined => {
  const events = getEvents();
  return events.find(e => e.eventCode === code);
};

export const getEventById = (id: string): Event | undefined => {
  const events = getEvents();
  return events.find(e => e.id === id);
};

export const getPublicEvents = (): Event[] => {
  const events = getEvents();
  return events.filter(e => e.isPublic && e.status === 'upcoming');
};

export const getUserHostedEvents = (userId: string): Event[] => {
  const events = getEvents();
  return events.filter(e => e.hostId === userId);
};

export const getUserJoinedEvents = (userId: string): Event[] => {
  const events = getEvents();
  return events.filter(e => e.guests.some(g => g.userId === userId));
};

export const joinEvent = (eventId: string, guest: Guest): boolean => {
  const events = getEvents();
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) return false;
  
  const event = events[eventIndex];
  
  // Check if already joined
  if (event.guests.some(g => g.userId === guest.userId)) {
    return false;
  }
  
  // Check max guests
  if (event.maxGuests && event.guests.length >= event.maxGuests) {
    return false;
  }
  
  event.guests.push(guest);
  events[eventIndex] = event;
  saveEvents(events);
  return true;
};

export const updateEventStatus = () => {
  const events = getEvents();
  const now = new Date();
  
  const updated = events.map(event => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    if (eventDate < now && event.status === 'upcoming') {
      return { ...event, status: 'completed' as const };
    }
    return event;
  });
  
  saveEvents(updated);
};

// Contact Storage
export const getContacts = (userId: string): Contact[] => {
  const stored = localStorage.getItem(CONTACTS_KEY);
  const contacts: Contact[] = stored ? JSON.parse(stored) : [];
  return contacts.filter(c => c.userId === userId);
};

export const saveContact = (contact: Omit<Contact, 'id'>): Contact => {
  const stored = localStorage.getItem(CONTACTS_KEY);
  const contacts: Contact[] = stored ? JSON.parse(stored) : [];
  const newContact: Contact = {
    ...contact,
    id: crypto.randomUUID(),
  };
  contacts.push(newContact);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  return newContact;
};

export const deleteContact = (contactId: string): void => {
  const stored = localStorage.getItem(CONTACTS_KEY);
  const contacts: Contact[] = stored ? JSON.parse(stored) : [];
  const filtered = contacts.filter(c => c.id !== contactId);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(filtered));
};

export const updateContact = (contactId: string, updates: Partial<Contact>): void => {
  const stored = localStorage.getItem(CONTACTS_KEY);
  const contacts: Contact[] = stored ? JSON.parse(stored) : [];
  const index = contacts.findIndex(c => c.id === contactId);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates };
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }
};

// Helpers
function generateEventCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
