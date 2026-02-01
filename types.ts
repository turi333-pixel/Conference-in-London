
export enum Category {
  AI_STRATEGY = 'AI Strategy',
  AGENTIC_AI = 'Agentic AI',
  DATA_ANALYTICS = 'Data & Analytics',
  CHANGE_MGMT = 'Change Management',
  INFRASTRUCTURE = 'Infrastructure',
  HUMAN_CENTRIC = 'Human-centric DTX',
  NETWORKING = 'Networking',
  GENERAL = 'General'
}

export enum SessionType {
  TALK = 'Talk',
  PANEL = 'Panel',
  BREAK = 'Break',
  EXPO = 'Expo'
}

export interface Session {
  id: string;
  day: number;
  startTime: string; // "HH:mm"
  endTime: string;
  title: string;
  speakers: string[];
  relevance: number; // 1-5
  categories: Category[];
  type: SessionType;
  venue: string;
  isCoLocated?: boolean;
}

export interface UserPreferences {
  priorities: Category[];
  savedSessions: string[];
  completedSessions: string[];
}

export type RecommendationType = 'must-attend' | 'optional' | 'skip';
