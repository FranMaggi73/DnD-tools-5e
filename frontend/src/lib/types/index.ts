export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  eventCount: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  dmId: string;
  dmName: string;
  dmPhoto: string;
  createdAt: string;
  playerIds: string[];
}

export interface EventMember {
  eventId: string;
  userId: string;
  role: 'dm' | 'player';
  userName: string;
  userPhoto: string;
  joinedAt: string;
}

export interface EventMembers {
  dm: EventMember | null;
  players: EventMember[];
}

export interface Invitation {
  id: string;
  eventId: string;
  eventName: string;
  eventDesc: string;
  fromUserId: string;
  fromName: string;
  fromPhoto: string;
  toUserId: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}