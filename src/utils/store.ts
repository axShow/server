import { create } from 'zustand'
import { CopterData } from './types'

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source?: string;
}

interface AppState {
  copters: CopterData[]
  setCopters: (copters: CopterData[]) => void
  logs: LogEntry[]
  addLog: (level: LogEntry['level'], message: string, source?: string) => void
  clearLogs: () => void
}

export const useStore = create<AppState>((set) => ({
  copters: [],
  setCopters: (copters) => set({ copters }),
  logs: [],
  addLog: (level, message, source) => set((state) => ({
    logs: [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        level,
        message,
        source
      },
      ...state.logs
    ].slice(0, 1000) // Keep last 1000 logs
  })),
  clearLogs: () => set({ logs: [] }),
}))

