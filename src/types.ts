export interface Participant {
  id: string;
  name: string;
}

export interface DrawResult {
  id: string;
  participant: Participant;
  timestamp: number;
}

export interface Group {
  id: string;
  name: string;
  members: Participant[];
}

export type AppTab = 'list' | 'draw' | 'group';
