import data from './instinctual-stacking.json';

export interface StackingDetail {
  summary: string;
  description: string;
  repressedInstinctIssues: string;
}

export type Stacking = "SP/SX" | "SP/SO" | "SX/SP" | "SX/SO" | "SO/SP" | "SO/SX";

export const InstinctualStackings: Record<Stacking, StackingDetail> = data;
