import data from './subtypes.json';

export interface Subtype {
  Type: string;
  Instinct: string;
  "Subtype Code": string;
  Archetype: string;
  Description: string;
  Keywords: string;
  "At Best": string;
  "At Worst": string;
  "One-liner": string;
}

export const Subtypes: Subtype[] = data;
