import { useState, useCallback, useEffect } from 'react';
import { Activity, RoutineInput, FixedCommitment, ActivityCategory } from '@/types/routine';
import { routineService } from '@/services/routine-service';
import { generateActivityId } from '@/lib/activity-utils';
import { sortActivitiesByTime } from '@/lib/time-utils';
import { useToast } from '@/hooks/use-toast';

const defaultInput: RoutineInput = {
  dayStartTime: '06:00',
  dayEndTime: '22:00',
  fixedCommitments: [],
  objectives: [],
  restrictions: [],
};

export function useRoutine() {
  const { toast } = useToast();
  const [input, setInput] = useState<RoutineInput>(defaultInput);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [savedRoutine, savedInput] = await Promise.all([
          routineService.loadRoutine(),
          routineService.loadInputPreferences(),
        ]);

        if (savedInput) {
          setInput(savedInput);
        }

        if (savedRoutine) {
          setActivities(savedRoutine.activities);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Update input fields
  const updateInput = useCallback((updates: Partial<RoutineInput>) => {
    setInput(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Add fixed commitment
  const addFixedCommitment = useCallback((commitment: Omit<FixedCommitment, 'id'>) => {
    const newCommitment: FixedCommitment = {
      ...commitment,
      id: generateActivityId(),
    };
    setInput(prev => ({
      ...prev,
      fixedCommitments: [...prev.fixedCommitments, newCommitment],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Remove fixed commitment
  const removeFixedCommitment = useCallback((id: string) => {
    setInput(prev => ({
      ...prev,
      fixedCommitments: prev.fixedCommitments.filter(c => c.id !== id),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add objective
  const addObjective = useCallback((objective: string) => {
    if (objective.trim()) {
      setInput(prev => ({
        ...prev,
        objectives: [...prev.objectives, objective.trim()],
      }));
      setHasUnsavedChanges(true);
    }
  }, []);

  // Remove objective
  const removeObjective = useCallback((index: number) => {
    setInput(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add restriction
  const addRestriction = useCallback((restriction: string) => {
    if (restriction.trim()) {
      setInput(prev => ({
        ...prev,
        restrictions: [...prev.restrictions, restriction.trim()],
      }));
      setHasUnsavedChanges(true);
    }
  }, []);

  // Remove restriction
  const removeRestriction = useCallback((index: number) => {
    setInput(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Generate routine (will call AI service)
  const generateRoutine = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Call the edge function to generate routine
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-routine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao gerar rotina');
      }

      const data = await response.json();
      const generatedActivities = data.activities as Activity[];
      
      setActivities(sortActivitiesByTime(generatedActivities) as Activity[]);
      setHasUnsavedChanges(true);
      
      toast({
        title: 'Rotina gerada!',
        description: 'Sua rotina foi criada com sucesso. Você pode ajustá-la como preferir.',
      });
    } catch (error) {
      console.error('Error generating routine:', error);
      toast({
        title: 'Erro ao gerar rotina',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [input, toast]);

  // Update activity
  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  // Delete activity
  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
    setHasUnsavedChanges(true);
    toast({
      title: 'Atividade removida',
      description: 'A atividade foi excluída da sua rotina.',
    });
  }, [toast]);

  // Add new activity manually
  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'order'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateActivityId(),
      order: activities.length,
    };
    setActivities(prev => sortActivitiesByTime([...prev, newActivity]) as Activity[]);
    setHasUnsavedChanges(true);
    toast({
      title: 'Atividade adicionada',
      description: 'A nova atividade foi incluída na sua rotina.',
    });
  }, [activities.length, toast]);

  // Reorder activities (for drag and drop)
  const reorderActivities = useCallback((newOrder: Activity[]) => {
    setActivities(newOrder.map((activity, index) => ({ ...activity, order: index })));
    setHasUnsavedChanges(true);
  }, []);

  // Save routine
  const saveRoutine = useCallback(async () => {
    try {
      await Promise.all([
        routineService.saveRoutine(activities),
        routineService.saveInputPreferences(input),
      ]);
      setHasUnsavedChanges(false);
      toast({
        title: 'Rotina salva!',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error saving routine:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar sua rotina. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [activities, input, toast]);

  // Clear routine
  const clearRoutine = useCallback(() => {
    setActivities([]);
    setHasUnsavedChanges(true);
  }, []);

  return {
    // State
    input,
    activities,
    isGenerating,
    isLoading,
    hasUnsavedChanges,
    
    // Input actions
    updateInput,
    addFixedCommitment,
    removeFixedCommitment,
    addObjective,
    removeObjective,
    addRestriction,
    removeRestriction,
    
    // Activity actions
    generateRoutine,
    updateActivity,
    deleteActivity,
    addActivity,
    reorderActivities,
    
    // Persistence
    saveRoutine,
    clearRoutine,
  };
}
