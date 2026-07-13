// src/types/index.ts
export interface Soldier {
  id: string;
  name: string;
  unit: string;
  rank: string;
  position: string;
  enlistmentDate?: string; // Dấu ? nghĩa là có thể không bắt buộc
  note?: string;
  status?: string;
}