import { ActivityCategory } from '@/types/routine';
import { 
  Briefcase, 
  BookOpen, 
  Dumbbell, 
  Gamepad2, 
  User, 
  UtensilsCrossed, 
  Moon,
  Heart,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';

interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const categoryConfig: Record<ActivityCategory, CategoryConfig> = {
  work: {
    label: 'Trabalho',
    icon: Briefcase,
    className: 'activity-block-work',
  },
  study: {
    label: 'Estudo',
    icon: BookOpen,
    className: 'activity-block-study',
  },
  exercise: {
    label: 'Exercício',
    icon: Dumbbell,
    className: 'activity-block-exercise',
  },
  leisure: {
    label: 'Lazer',
    icon: Gamepad2,
    className: 'activity-block-leisure',
  },
  personal: {
    label: 'Pessoal',
    icon: User,
    className: 'activity-block-personal',
  },
  meal: {
    label: 'Refeição',
    icon: UtensilsCrossed,
    className: 'activity-block-meal',
  },
  sleep: {
    label: 'Descanso',
    icon: Moon,
    className: 'activity-block-sleep',
  },
  health: {
    label: 'Saúde',
    icon: Heart,
    className: 'activity-block-health',
  },
  other: {
    label: 'Outro',
    icon: MoreHorizontal,
    className: 'activity-block-other',
  },
};

export function getCategoryLabel(category: ActivityCategory): string {
  return categoryConfig[category]?.label ?? 'Outro';
}

export function getCategoryIcon(category: ActivityCategory): LucideIcon {
  return categoryConfig[category]?.icon ?? categoryConfig.other.icon;
}

export function getCategoryClassName(category: ActivityCategory): string {
  return categoryConfig[category]?.className ?? 'activity-block-other';
}

export function generateActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
