import data from './wings.json';

export interface Wing {
  "Type + Strongest Wing": string;
  "Dominant Type": string;
  "Strongest Wing": string;
  "Description": string;
  "Keywords": string;
}

export const Wings: Wing[] = data;
