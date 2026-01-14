import { Activity, Routine, RoutineInput } from '@/types/routine';

const STORAGE_KEY = 'routine_data';

// Service layer prepared for Supabase integration
// Currently uses localStorage as a fallback until database is connected

export const routineService = {
  // Save routine locally (will be replaced with Supabase)
  async saveRoutine(activities: Activity[], name: string = 'Minha Rotina'): Promise<Routine> {
    const routine: Routine = {
      id: `routine-${Date.now()}`,
      name,
      activities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Temporary local storage - will be replaced with Supabase
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routine));
    
    return routine;
  },

  // Load routine from local storage (will be replaced with Supabase)
  async loadRoutine(): Promise<Routine | null> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as Routine;
    } catch {
      return null;
    }
  },

  // Clear saved routine
  async clearRoutine(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Save routine input preferences
  async saveInputPreferences(input: RoutineInput): Promise<void> {
    localStorage.setItem(`${STORAGE_KEY}_input`, JSON.stringify(input));
  },

  // Load routine input preferences
  async loadInputPreferences(): Promise<RoutineInput | null> {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_input`);
      if (!data) return null;
      return JSON.parse(data) as RoutineInput;
    } catch {
      return null;
    }
  },
};
