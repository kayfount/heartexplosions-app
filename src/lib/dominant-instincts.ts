import data from './dominant-instincts.json';

export interface InstinctDetail {
  name: string;
  alias: string | null;
  description: string;
  focusOfAttention: string;
  whatYouWantToKnow: string;
  whatYoureSearchingFor: string;
  inARoom: string;
  memory: string;
  reward: string;
  homebase: string;
  addictedTo: string;
  trigger: string;
  inPartnershipsAndTeams: string;
}

export type Instinct = "SP" | "SX" | "SO";

export const DominantInstincts: Record<Instinct, InstinctDetail> = data;
