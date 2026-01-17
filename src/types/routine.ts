export type ActivityCategory = 
  | 'work' 
  | 'study' 
  | 'exercise' 
  | 'leisure' 
  | 'personal' 
  | 'meal' 
  | 'sleep' 
  | 'health'
  | 'other';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  category: ActivityCategory;
  isFixed: boolean;
  order: number;
}

export interface RoutineInput {
  dayStartTime: string; // HH:mm format
  dayEndTime: string; // HH:mm format
  fixedCommitments: FixedCommitment[];
  objectives: string[];
  restrictions: string[];
}

export interface FixedCommitment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: ActivityCategory;
}

export interface Routine {
  id: string;
  name: string;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineState {
  input: RoutineInput;
  activities: Activity[];
  isGenerating: boolean;
  hasUnsavedChanges: boolean;
}
