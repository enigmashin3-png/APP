import { create } from "zustand";

type RateLimit = { limit?: number; remaining?: number; retryAfter?: number } | null;
type SupportState = {
  lastRequestId: string | null;
  rateLimit: RateLimit;
  setLastRequestId: (id: string | null) => void;
  setRateLimit: (rl: RateLimit) => void;
};

export const useSupportStore = create<SupportState>((set) => ({
  lastRequestId: null,
  rateLimit: null,
  setLastRequestId: (id) => set({ lastRequestId: id }),
  setRateLimit: (rl) => set({ rateLimit: rl }),
}));
