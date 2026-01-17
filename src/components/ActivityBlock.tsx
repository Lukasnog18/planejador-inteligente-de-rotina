import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Activity } from '@/types/routine';
import { categoryConfig } from '@/lib/activity-utils';
import { formatTimeDisplay, getDurationInMinutes, formatDuration } from '@/lib/time-utils';
import { GripVertical, Trash2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityBlockProps {
  activity: Activity;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ActivityBlock({ activity, isSelected, onSelect, onDelete }: ActivityBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = categoryConfig[activity.category] ?? categoryConfig.other;
  const Icon = config.icon;
  const duration = getDurationInMinutes(activity.startTime, activity.endTime);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'activity-block mb-3',
        config.className,
        isDragging && 'dragging z-50',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1 rounded hover:bg-white/20 cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical className="w-4 h-4 opacity-70" />
        </button>

        {/* Icon */}
        <div className="mt-0.5 p-2 rounded-lg bg-white/20">
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                {activity.title}
                {activity.isFixed && (
                  <Lock className="w-3 h-3 opacity-70" />
                )}
              </h4>
              <p className="text-sm opacity-80">
                {formatTimeDisplay(activity.startTime)} - {formatTimeDisplay(activity.endTime)}
                <span className="mx-2">•</span>
                {formatDuration(duration)}
              </p>
            </div>

            {/* Delete button */}
            {!activity.isFixed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors opacity-70 hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {activity.description && (
            <p className="text-sm opacity-70 mt-2 line-clamp-2">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
