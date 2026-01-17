import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ActivityCategory } from '@/types/routine';
import { categoryConfig } from '@/lib/activity-utils';
import { formatDuration, getDurationInMinutes } from '@/lib/time-utils';
import { 
  Save, 
  Trash2, 
  Plus, 
  Edit3, 
  Clock,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuickAdjustPanelProps {
  selectedActivity: Activity | null;
  hasUnsavedChanges: boolean;
  isSaving?: boolean;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'order'>) => void;
  onSaveRoutine: () => void;
  onClearSelection: () => void;
}

export function QuickAdjustPanel({
  selectedActivity,
  hasUnsavedChanges,
  isSaving = false,
  onUpdateActivity,
  onDeleteActivity,
  onAddActivity,
  onSaveRoutine,
  onClearSelection,
}: QuickAdjustPanelProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editedActivity, setEditedActivity] = useState<Partial<Activity>>({});
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'other' as ActivityCategory,
    isFixed: false,
  });

  // Update local state when selected activity changes
  React.useEffect(() => {
    if (selectedActivity) {
      setEditedActivity({});
      setIsAddingNew(false);
    }
  }, [selectedActivity?.id]);

  const handleSaveEdit = () => {
    if (selectedActivity && Object.keys(editedActivity).length > 0) {
      onUpdateActivity(selectedActivity.id, editedActivity);
      setEditedActivity({});
    }
  };

  const handleAddNew = () => {
    if (newActivity.title.trim()) {
      onAddActivity(newActivity);
      setNewActivity({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        category: 'other',
        isFixed: false,
      });
      setIsAddingNew(false);
    }
  };

  const currentActivity = selectedActivity 
    ? { ...selectedActivity, ...editedActivity }
    : null;

  return (
    <div className="panel-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-primary" />
          Ajustes
        </h2>
        {hasUnsavedChanges && (
          <Button
            onClick={onSaveRoutine}
            size="sm"
            className="bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {isAddingNew ? (
            <motion.div
              key="add-new"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Nova Atividade</h3>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Título</Label>
                  <Input
                    value={newActivity.title}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome da atividade"
                    className="input-styled mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Descrição (opcional)</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalhes da atividade..."
                    className="input-styled mt-1 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Início</Label>
                    <Input
                      type="time"
                      value={newActivity.startTime}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, startTime: e.target.value }))}
                      className="input-styled mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Fim</Label>
                    <Input
                      type="time"
                      value={newActivity.endTime}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, endTime: e.target.value }))}
                      className="input-styled mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Categoria</Label>
                  <Select
                    value={newActivity.category}
                    onValueChange={(value) => setNewActivity(prev => ({ ...prev, category: value as ActivityCategory }))}
                  >
                    <SelectTrigger className="input-styled mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="w-4 h-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddNew}
                  className="w-full btn-accent"
                  disabled={!newActivity.title.trim()}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </motion.div>
          ) : currentActivity ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Editar Atividade</h3>
                <button
                  onClick={onClearSelection}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category indicator */}
              <div className={`p-4 rounded-xl ${categoryConfig[currentActivity.category].className}`}>
                <div className="flex items-center gap-3">
                  {React.createElement(categoryConfig[currentActivity.category].icon, {
                    className: 'w-5 h-5',
                  })}
                  <span className="font-medium">
                    {categoryConfig[currentActivity.category].label}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Título</Label>
                  <Input
                    value={editedActivity.title ?? currentActivity.title}
                    onChange={(e) => setEditedActivity(prev => ({ ...prev, title: e.target.value }))}
                    className="input-styled mt-1"
                    disabled={currentActivity.isFixed}
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Descrição</Label>
                  <Textarea
                    value={editedActivity.description ?? currentActivity.description ?? ''}
                    onChange={(e) => setEditedActivity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Adicionar descrição..."
                    className="input-styled mt-1 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Início</Label>
                    <Input
                      type="time"
                      value={editedActivity.startTime ?? currentActivity.startTime}
                      onChange={(e) => setEditedActivity(prev => ({ ...prev, startTime: e.target.value }))}
                      className="input-styled mt-1"
                      disabled={currentActivity.isFixed}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Fim</Label>
                    <Input
                      type="time"
                      value={editedActivity.endTime ?? currentActivity.endTime}
                      onChange={(e) => setEditedActivity(prev => ({ ...prev, endTime: e.target.value }))}
                      className="input-styled mt-1"
                      disabled={currentActivity.isFixed}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Duração: {formatDuration(getDurationInMinutes(
                    editedActivity.startTime ?? currentActivity.startTime,
                    editedActivity.endTime ?? currentActivity.endTime
                  ))}
                </div>

                {!currentActivity.isFixed && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Categoria</Label>
                    <Select
                      value={editedActivity.category ?? currentActivity.category}
                      onValueChange={(value) => setEditedActivity(prev => ({ ...prev, category: value as ActivityCategory }))}
                    >
                      <SelectTrigger className="input-styled mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="w-4 h-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {Object.keys(editedActivity).length > 0 && (
                  <Button
                    onClick={handleSaveEdit}
                    className="w-full"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aplicar Alterações
                  </Button>
                )}

                {!currentActivity.isFixed && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onDeleteActivity(currentActivity.id);
                      onClearSelection();
                    }}
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Atividade
                  </Button>
                )}

                {currentActivity.isFixed && (
                  <p className="text-xs text-muted-foreground text-center">
                    Esta é uma atividade fixa e não pode ser removida.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center px-4 pt-4"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Edit3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Nenhuma atividade selecionada</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Clique em uma atividade na linha do tempo para editá-la, ou adicione uma nova.
              </p>
              <Button
                onClick={() => setIsAddingNew(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Atividade
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add new button when editing or empty */}
      {!isAddingNew && (
        <div className="pt-4 mt-auto border-t border-border/50">
          <Button
            onClick={() => setIsAddingNew(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Atividade Manual
          </Button>
        </div>
      )}
    </div>
  );
}
