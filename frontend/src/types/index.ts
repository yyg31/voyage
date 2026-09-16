export type Role = 'ADMIN' | 'MEMBER';

export type ActivityType = 'FLIGHT' | 'TRANSPORT' | 'RESTAURANT' | 'EXCURSION' | 'VISIT' | 'HOTEL' | 'OTHER';

export type LinkType = 'HOTEL' | 'FLIGHT' | 'RESTAURANT' | 'EXCURSION' | 'INFO' | 'OTHER';

export type LinkVisibility = 'BOTH' | 'BACK' | 'YGOUF';

export interface Family {
  id: string;
  name: string;
  colorHex: string;
  members?: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'>[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  familyId: string;
  avatarColor: string;
  family?: Family;
  createdAt?: string;
}

export interface StopoverFamily {
  id: string;
  familyId: string;
  family: Family;
  arrivalDate: string;
  departureDate: string;
}

export interface Stopover {
  id: string;
  name: string;
  country: string;
  colorHex: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
  families: StopoverFamily[];
  _count?: { activities: number; links: number };
}

export interface ActivityParticipant {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'familyId'>;
}

export interface Activity {
  id: string;
  stopoverId: string | null;
  stopover: Stopover | null;
  title: string;
  description: string | null;
  type: ActivityType;
  location: string | null;
  startDateTime: string;
  endDateTime: string | null;
  participants: ActivityParticipant[];
  flight?: Flight | null;
}

export interface FlightParticipant {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'familyId'>;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  departureDateTime: string;
  arrivalDateTime: string;
  ticketFileUrl: string | null;
  participants: FlightParticipant[];
  activity?: Activity | null;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  type: LinkType;
  stopoverId: string | null;
  stopover?: Pick<Stopover, 'id' | 'name'> | null;
  visibility: LinkVisibility;
  familyId: string | null;
  family?: Pick<Family, 'id' | 'name' | 'colorHex'> | null;
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>;
  createdAt: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  _count?: { threads: number };
}

export interface ForumMessage {
  id: string;
  threadId: string;
  content: string;
  createdAt: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarColor' | 'familyId'>;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  category: ForumCategory;
  title: string;
  createdAt: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarColor' | 'familyId'>;
  messages?: ForumMessage[];
  _count?: { messages: number };
}
