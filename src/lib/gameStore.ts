import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameStats {
    knowledge: number;
    patience: number;
    adaptability: number;
    charm: number;
    skill: number;
    stamina: number;
    maxStamina: number;
    stress: number;
    maxStress: number;
    money: number;
    experience: number;
    level: number;
}

export interface GameCalendar {
    year: number;
    month: number;
    week: number;
}

export type GameMode = 'strategy' | 'novel' | 'quiz' | 'action' | 'action_menu';

interface GameState {
    stats: GameStats;
    calendar: GameCalendar;
    playerName: string;
    isInitialized: boolean;
    gameMode: GameMode;
    currentActionType: string | null;
    currentScenarioId: string | null;
    scenarioIndex: number;
    playerGender: 'male' | 'female';

    // Actions
    initGame: (name: string) => void;
    updateStats: (updates: Partial<GameStats>) => void;
    advanceWeek: () => void;
    resetGame: () => void;
    addExperience: (exp: number) => void;
    setGameMode: (mode: GameMode) => void;
    modifyStats: (changes: Partial<Record<keyof GameStats, number>>) => void;
    setActionType: (type: string | null) => void;
    startScenario: (scenarioId: string) => void;
    setScenarioIndex: (index: number) => void;
    setPlayerGender: (gender: 'male' | 'female') => void;
}

const INITIAL_STATS: GameStats = {
    knowledge: 20,
    patience: 20,
    adaptability: 20,
    charm: 20,
    skill: 20,
    stamina: 100,
    maxStamina: 100,
    stress: 0,
    maxStress: 100,
    money: 10000,
    experience: 0,
    level: 1
};

const INITIAL_CALENDAR: GameCalendar = {
    year: 3,
    month: 4,
    week: 1
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            stats: INITIAL_STATS,
            calendar: INITIAL_CALENDAR,
            playerName: 'まさる',
            isInitialized: false,
            gameMode: 'strategy',
            currentActionType: null,
            currentScenarioId: null,
            scenarioIndex: 0,
            playerGender: 'male',

            initGame: (name) => set({
                playerName: name,
                isInitialized: true,
                stats: INITIAL_STATS,
                calendar: INITIAL_CALENDAR,
                gameMode: 'novel',
                currentActionType: null,
                currentScenarioId: 'intro',
                scenarioIndex: 0,
                playerGender: 'male'
            }),

            updateStats: (updates) => set((state) => {
                const newStats = { ...state.stats, ...updates };

                // Clamp values
                newStats.stamina = Math.min(newStats.maxStamina, Math.max(0, newStats.stamina));
                newStats.stress = Math.min(newStats.maxStress, Math.max(0, newStats.stress));

                return { stats: newStats };
            }),

            addExperience: (exp) => set((state) => {
                let newExp = state.stats.experience + exp;
                let newLevel = state.stats.level;

                // Simple level up logic: level * 100 exp needed
                while (newExp >= newLevel * 100) {
                    newExp -= newLevel * 100;
                    newLevel++;
                }

                return {
                    stats: {
                        ...state.stats,
                        experience: newExp,
                        level: newLevel
                    }
                };
            }),

            advanceWeek: () => set((state) => {
                let { year, month, week } = state.calendar;
                week++;
                if (week > 4) {
                    week = 1;
                    month++;
                    if (month > 12) {
                        month = 1;
                        year++;
                    }
                }

                return { calendar: { year, month, week } };
            }),

            setGameMode: (gameMode) => set({ gameMode }),

            modifyStats: (changes) => set((state) => {
                const newStats = { ...state.stats };
                Object.entries(changes).forEach(([key, value]) => {
                    const k = key as keyof GameStats;
                    if (typeof value === 'number') {
                        (newStats as Record<keyof GameStats, number>)[k] += value;
                    }
                });

                // Clamp values
                newStats.stamina = Math.min(newStats.maxStamina, Math.max(0, newStats.stamina));
                newStats.stress = Math.min(newStats.maxStress, Math.max(0, newStats.stress));

                return { stats: newStats };
            }),

            setActionType: (currentActionType) => set({ currentActionType }),

            startScenario: (scenarioId) => set({
                currentScenarioId: scenarioId,
                scenarioIndex: 0,
                gameMode: 'novel'
            }),

            setScenarioIndex: (scenarioIndex) => set({ scenarioIndex }),

            setPlayerGender: (playerGender) => set({ playerGender }),

            resetGame: () => set({
                stats: INITIAL_STATS,
                calendar: INITIAL_CALENDAR,
                isInitialized: false,
                gameMode: 'strategy',
                currentActionType: null,
                currentScenarioId: null,
                scenarioIndex: 0,
                playerGender: 'male'
            })
        }),
        {
            name: 'ehime-base-game-store',
        }
    )
);
