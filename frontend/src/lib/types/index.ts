export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  campaignCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  dmId: string;
  dmName: string;
  dmPhoto: string;
  createdAt: string;
  playerIds: string[];
}

export interface CampaignMember {
  campaignId: string;
  userId: string;
  role: 'dm' | 'player';
  userName: string;
  userPhoto: string;
  joinedAt: string;
}

export interface CampaignMembers {
  dm: CampaignMember | null;
  players: CampaignMember[];
}

export interface Invitation {
  id: string;
  campaignId: string;
  campaignName: string;
  fromUserId: string;
  fromName: string;
  fromPhoto: string;
  toUserId: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}