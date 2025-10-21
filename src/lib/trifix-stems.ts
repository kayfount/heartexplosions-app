import data from './trifix-stems.json';

export interface TrifixStem {
  "Parent Tritype": string;
  "Archetype": string;
  "Core Description": string;
  "Stem 1": string;
  "Stem 1 Keywords": string;
  "Stem 2": string;
  "Stem 2 Keywords": string;
  "Stem 3": string;
  "Stem 3 Keywords": string;
}

export const TrifixStems: TrifixStem[] = data;
