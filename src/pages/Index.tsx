import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { InputPanel } from '@/components/InputPanel';
import { TimelineView } from '@/components/TimelineView';
import { QuickAdjustPanel } from '@/components/QuickAdjustPanel';
import { AuthForm } from '@/components/AuthForm';
import { useRoutine } from '@/hooks/use-routine';
import { useAuth } from '@/contexts/AuthContext';
import { Activity } from '@/types/routine';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const {
    input,
    activities,
    isGenerating,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    updateInput,
    addFixedCommitment,
    removeFixedCommitment,
    addObjective,
    removeObjective,
    addRestriction,
    removeRestriction,
    generateRoutine,
    updateActivity,
    deleteActivity,
    addActivity,
    reorderActivities,
    saveRoutine,
  } = useRoutine();

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'input' | 'timeline' | 'adjust'>('timeline');

  const handleSelectActivity = (activity: Activity | null) => {
    setSelectedActivity(activity);
    if (activity) {
      setMobilePanel('adjust');
    }
  };

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Mobile Navigation */}
      <div className="lg:hidden sticky top-[73px] z-40 glass-effect border-b border-border/50">
        <div className="flex">
          <button
            onClick={() => setMobilePanel('input')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              mobilePanel === 'input' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            )}
          >
            Configurar
          </button>
          <button
            onClick={() => setMobilePanel('timeline')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              mobilePanel === 'timeline' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            )}
          >
            Timeline
          </button>
          <button
            onClick={() => setMobilePanel('adjust')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              mobilePanel === 'adjust' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            )}
          >
            Ajustes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-3"
          >
            <InputPanel
              input={input}
              isGenerating={isGenerating}
              onUpdateInput={updateInput}
              onAddCommitment={addFixedCommitment}
              onRemoveCommitment={removeFixedCommitment}
              onAddObjective={addObjective}
              onRemoveObjective={removeObjective}
              onAddRestriction={addRestriction}
              onRemoveRestriction={removeRestriction}
              onGenerate={generateRoutine}
            />
          </motion.div>

          {/* Timeline View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="col-span-6"
          >
            <TimelineView
              activities={activities}
              dayStartTime={input.dayStartTime}
              dayEndTime={input.dayEndTime}
              isLoading={isLoading}
              isGenerating={isGenerating}
              onUpdateActivity={updateActivity}
              onDeleteActivity={deleteActivity}
              onReorderActivities={reorderActivities}
              onSelectActivity={handleSelectActivity}
              selectedActivityId={selectedActivity?.id ?? null}
            />
          </motion.div>

          {/* Quick Adjust Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-3"
          >
            <QuickAdjustPanel
              selectedActivity={selectedActivity}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onUpdateActivity={updateActivity}
              onDeleteActivity={deleteActivity}
              onAddActivity={addActivity}
              onSaveRoutine={saveRoutine}
              onClearSelection={() => setSelectedActivity(null)}
            />
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden h-[calc(100vh-180px)]">
          {mobilePanel === 'input' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <InputPanel
                input={input}
                isGenerating={isGenerating}
                onUpdateInput={updateInput}
                onAddCommitment={addFixedCommitment}
                onRemoveCommitment={removeFixedCommitment}
                onAddObjective={addObjective}
                onRemoveObjective={removeObjective}
                onAddRestriction={addRestriction}
                onRemoveRestriction={removeRestriction}
                onGenerate={() => {
                  generateRoutine();
                  setMobilePanel('timeline');
                }}
              />
            </motion.div>
          )}

          {mobilePanel === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <TimelineView
                activities={activities}
                dayStartTime={input.dayStartTime}
                dayEndTime={input.dayEndTime}
                isLoading={isLoading}
                isGenerating={isGenerating}
                onUpdateActivity={updateActivity}
                onDeleteActivity={deleteActivity}
                onReorderActivities={reorderActivities}
                onSelectActivity={handleSelectActivity}
                selectedActivityId={selectedActivity?.id ?? null}
              />
            </motion.div>
          )}

          {mobilePanel === 'adjust' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <QuickAdjustPanel
                selectedActivity={selectedActivity}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
                onUpdateActivity={updateActivity}
                onDeleteActivity={deleteActivity}
                onAddActivity={addActivity}
                onSaveRoutine={saveRoutine}
                onClearSelection={() => setSelectedActivity(null)}
              />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
