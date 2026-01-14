import { useState, useCallback, useEffect } from 'react';
import { Activity, RoutineInput, FixedCommitment, ActivityCategory } from '@/types/routine';
import { routineService, DbRoutine } from '@/services/routine-service';
import { generateActivityId } from '@/lib/activity-utils';
import { sortActivitiesByTime } from '@/lib/time-utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const defaultInput: RoutineInput = {
  dayStartTime: '06:00',
  dayEndTime: '22:00',
  fixedCommitments: [],
  objectives: [],
  restrictions: [],
};

export function useRoutine() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [input, setInput] = useState<RoutineInput>(defaultInput);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<DbRoutine | null>(null);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const routine = await routineService.getOrCreateRoutine(user.id);
        
        if (routine) {
          setCurrentRoutine(routine);
          
          // Update input with routine times
          setInput(prev => ({
            ...prev,
            dayStartTime: routine.start_time.slice(0, 5),
            dayEndTime: routine.end_time.slice(0, 5),
          }));

          // Load activities
          const loadedActivities = await routineService.getActivities(routine.id);
          setActivities(loadedActivities);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar suas rotinas.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

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

  // Generate routine (calls AI service)
  const generateRoutine = useCallback(async () => {
    setIsGenerating(true);
    
    try {
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
      
      const sortedActivities = sortActivitiesByTime(generatedActivities) as Activity[];
      setActivities(sortedActivities);
      setHasUnsavedChanges(true);
      
      toast({
        title: 'Rotina gerada!',
        description: 'Sua rotina foi criada. Clique em "Salvar" para persistir as alterações.',
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
  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    // Update local state immediately
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
    
    // Update in database
    const success = await routineService.updateActivity(id, updates);
    if (!success) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar a alteração.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Delete activity
  const deleteActivity = useCallback(async (id: string) => {
    // Update local state immediately
    setActivities(prev => prev.filter(activity => activity.id !== id));
    
    // Delete from database
    const success = await routineService.deleteActivity(id);
    if (success) {
      toast({
        title: 'Atividade removida',
        description: 'A atividade foi excluída da sua rotina.',
      });
    } else {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível excluir a atividade.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Add new activity manually
  const addActivity = useCallback(async (activity: Omit<Activity, 'id' | 'order'>) => {
    if (!currentRoutine) return;

    const newActivity = await routineService.addActivity(currentRoutine.id, {
      ...activity,
      order: activities.length,
    });

    if (newActivity) {
      setActivities(prev => sortActivitiesByTime([...prev, newActivity]) as Activity[]);
      toast({
        title: 'Atividade adicionada',
        description: 'A nova atividade foi incluída na sua rotina.',
      });
    } else {
      toast({
        title: 'Erro ao adicionar',
        description: 'Não foi possível adicionar a atividade.',
        variant: 'destructive',
      });
    }
  }, [activities.length, currentRoutine, toast]);

  // Reorder activities (for drag and drop)
  const reorderActivities = useCallback(async (newOrder: Activity[]) => {
    const reorderedActivities = newOrder.map((activity, index) => ({ ...activity, order: index }));
    setActivities(reorderedActivities);
    
    // Update order in database
    await routineService.updateActivityOrder(reorderedActivities);
  }, []);

  // Save routine to database
  const saveRoutine = useCallback(async () => {
    if (!currentRoutine || !user) return;

    setIsSaving(true);
    try {
      // Update routine times
      await routineService.updateRoutine(currentRoutine.id, {
        start_time: input.dayStartTime,
        end_time: input.dayEndTime,
      });

      // Save all activities
      const success = await routineService.saveActivities(currentRoutine.id, activities);
      
      if (success) {
        setHasUnsavedChanges(false);
        toast({
          title: 'Rotina salva!',
          description: 'Suas alterações foram salvas com sucesso.',
        });

        // Reload activities to get server-generated IDs
        const reloadedActivities = await routineService.getActivities(currentRoutine.id);
        setActivities(reloadedActivities);
      } else {
        throw new Error('Falha ao salvar atividades');
      }
    } catch (error) {
      console.error('Error saving routine:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar sua rotina. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [activities, currentRoutine, input.dayEndTime, input.dayStartTime, toast, user]);

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
    isSaving,
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
