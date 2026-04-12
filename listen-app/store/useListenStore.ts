import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ListenState = 'idle' | 'listening' | 'processing' | 'paused';

export interface UserStats {
  totalPacketsProcessed: number;
  totalHours: number;
  anomaliesDetected: number;
  skyCoverage: number;       // 0..1
  streakDays: number;
  lastActiveAt: string | null;
  scannedSectors: string[];
}

export interface UserSettings {
  wifiOnly: boolean;
  chargingOnly: boolean;
  quietStartHour: number;
  quietEndHour: number;
  maxBytesPerNight: number;
  notificationsEnabled: boolean;
  language: string | null;   // null = auto-detect
}

export interface GlobalStats {
  activePhones: number;
  countries: number;
  petaFlops: number;
  skySectorsScanned: number;
}

interface ListenStore {
  userId: string | null;
  state: ListenState;
  stats: UserStats;
  settings: UserSettings;
  globalStats: GlobalStats;
  currentSector: string | null;

  setUserId: (id: string) => void;
  setState: (s: ListenState) => void;
  setCurrentSector: (sector: string | null) => void;
  recordPacketProcessed: (sector: string, wasAnomaly: boolean) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  updateGlobalStats: (patch: Partial<GlobalStats>) => void;
  reset: () => void;
}

const INITIAL_STATS: UserStats = {
  totalPacketsProcessed: 0,
  totalHours: 0,
  anomaliesDetected: 0,
  skyCoverage: 0,
  streakDays: 0,
  lastActiveAt: null,
  scannedSectors: [],
};

const INITIAL_SETTINGS: UserSettings = {
  wifiOnly: true,
  chargingOnly: true,
  quietStartHour: 23,
  quietEndHour: 7,
  maxBytesPerNight: 50 * 1024 * 1024,
  notificationsEnabled: true,
  language: null,
};

const INITIAL_GLOBAL: GlobalStats = {
  activePhones: 12_847_293,
  countries: 193,
  petaFlops: 2.4,
  skySectorsScanned: 47,
};

// Total number of sky sectors that make up the 100% coverage target.
const TOTAL_SKY_SECTORS = 500;

export const useListenStore = create<ListenStore>()(
  persist(
    (set) => ({
      userId: null,
      state: 'idle',
      stats: INITIAL_STATS,
      settings: INITIAL_SETTINGS,
      globalStats: INITIAL_GLOBAL,
      currentSector: null,

      setUserId: (id) => set({ userId: id }),
      setState: (s) => set({ state: s }),
      setCurrentSector: (sector) => set({ currentSector: sector }),

      recordPacketProcessed: (sector, wasAnomaly) =>
        set((prev) => {
          const scanned = prev.stats.scannedSectors.includes(sector)
            ? prev.stats.scannedSectors
            : [...prev.stats.scannedSectors, sector];
          return {
            stats: {
              ...prev.stats,
              totalPacketsProcessed: prev.stats.totalPacketsProcessed + 1,
              anomaliesDetected: prev.stats.anomaliesDetected + (wasAnomaly ? 1 : 0),
              skyCoverage: scanned.length / TOTAL_SKY_SECTORS,
              scannedSectors: scanned,
              lastActiveAt: new Date().toISOString(),
            },
          };
        }),

      updateSettings: (patch) =>
        set((prev) => ({ settings: { ...prev.settings, ...patch } })),

      updateGlobalStats: (patch) =>
        set((prev) => ({ globalStats: { ...prev.globalStats, ...patch } })),

      reset: () =>
        set({
          state: 'idle',
          stats: INITIAL_STATS,
          currentSector: null,
        }),
    }),
    {
      name: 'listen-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        stats: state.stats,
        settings: state.settings,
      }),
    },
  ),
);
