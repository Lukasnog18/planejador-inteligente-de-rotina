import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Activity } from '@/types/routine';
import { ActivityBlock } from './ActivityBlock';
import { generateTimeSlots, timeToMinutes } from '@/lib/time-utils';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface TimelineViewProps {
  activities: Activity[];
  dayStartTime: string;
  dayEndTime: string;
  isLoading: boolean;
  isGenerating: boolean;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
  onReorderActivities: (activities: Activity[]) => void;
  onSelectActivity: (activity: Activity | null) => void;
  selectedActivityId: string | null;
}

export function TimelineView({
  activities,
  dayStartTime,
  dayEndTime,
  isLoading,
  isGenerating,
  onUpdateActivity,
  onDeleteActivity,
  onReorderActivities,
  onSelectActivity,
  selectedActivityId,
}: TimelineViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const timeSlots = generateTimeSlots(dayStartTime, dayEndTime, 60);
  const totalMinutes = timeToMinutes(dayEndTime) - timeToMinutes(dayStartTime);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activities.findIndex((a) => a.id === active.id);
      const newIndex = activities.findIndex((a) => a.id === over.id);
      const newOrder = arrayMove(activities, oldIndex, newIndex);
      onReorderActivities(newOrder);
    }
  };

  const getActivityPosition = (activity: Activity) => {
    const startMinutes = timeToMinutes(activity.startTime) - timeToMinutes(dayStartTime);
    const endMinutes = timeToMinutes(activity.endTime) - timeToMinutes(dayStartTime);
    const duration = endMinutes - startMinutes;
    
    return {
      top: (startMinutes / totalMinutes) * 100,
      height: (duration / totalMinutes) * 100,
    };
  };

  if (isLoading) {
    return (
      <div className="panel-card p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Sua Rotina
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {dayStartTime} - {dayEndTime}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {isGenerating ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Gerando sua rotina...</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Estamos criando uma rotina personalizada com base nas suas preferências.
                    </p>
                  </div>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Nenhuma rotina ainda</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Configure seus horários, compromissos e objetivos no painel ao lado, 
                      depois clique em "Gerar Rotina".
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar pr-2">
            <div className="relative min-h-full">
              {/* Time markers */}
              <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="flex-1 relative"
                    style={{ minHeight: '80px' }}
                  >
                    <span className="timeline-hour-marker absolute -top-2 left-0">
                      {time}
                    </span>
                    {index < timeSlots.length - 1 && (
                      <div className="absolute top-0 left-14 right-0 border-t border-dashed border-border/50" />
                    )}
                  </div>
                ))}
              </div>

              {/* Activities */}
              <div className="ml-20 relative" style={{ minHeight: `${timeSlots.length * 80}px` }}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={activities.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence mode="popLayout">
                      {activities.map((activity) => (
                        <ActivityBlock
                          key={activity.id}
                          activity={activity}
                          isSelected={selectedActivityId === activity.id}
                          onSelect={() => onSelectActivity(
                            selectedActivityId === activity.id ? null : activity
                          )}
                          onDelete={() => onDeleteActivity(activity.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
