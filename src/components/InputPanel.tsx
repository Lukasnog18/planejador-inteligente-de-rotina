import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Plus, 
  X, 
  Target, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RoutineInput, FixedCommitment, ActivityCategory } from '@/types/routine';
import { categoryConfig } from '@/lib/activity-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InputPanelProps {
  input: RoutineInput;
  isGenerating: boolean;
  onUpdateInput: (updates: Partial<RoutineInput>) => void;
  onAddCommitment: (commitment: Omit<FixedCommitment, 'id'>) => void;
  onRemoveCommitment: (id: string) => void;
  onAddObjective: (objective: string) => void;
  onRemoveObjective: (index: number) => void;
  onAddRestriction: (restriction: string) => void;
  onRemoveRestriction: (index: number) => void;
  onGenerate: () => void;
}

export function InputPanel({
  input,
  isGenerating,
  onUpdateInput,
  onAddCommitment,
  onRemoveCommitment,
  onAddObjective,
  onRemoveObjective,
  onAddRestriction,
  onRemoveRestriction,
  onGenerate,
}: InputPanelProps) {
  const [newCommitment, setNewCommitment] = useState({
    title: '',
    startTime: '09:00',
    endTime: '17:00',
    category: 'work' as ActivityCategory,
  });
  const [newObjective, setNewObjective] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('time');

  const handleAddCommitment = () => {
    if (newCommitment.title.trim()) {
      onAddCommitment(newCommitment);
      setNewCommitment({
        title: '',
        startTime: '09:00',
        endTime: '17:00',
        category: 'work',
      });
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      onAddObjective(newObjective);
      setNewObjective('');
    }
  };

  const handleAddRestriction = () => {
    if (newRestriction.trim()) {
      onAddRestriction(newRestriction);
      setNewRestriction('');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SectionHeader = ({ 
    section, 
    icon: Icon, 
    title, 
    count 
  }: { 
    section: string; 
    icon: React.ElementType; 
    title: string; 
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="font-medium">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
            {count}
          </span>
        )}
      </div>
      {expandedSection === section ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="panel-card p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Configure sua Rotina
      </h2>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {/* Time Settings */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <SectionHeader section="time" icon={Clock} title="Horários do Dia" />
          <AnimatePresence>
            {expandedSection === 'time' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Início do dia</Label>
                      <Input
                        type="time"
                        value={input.dayStartTime}
                        onChange={(e) => onUpdateInput({ dayStartTime: e.target.value })}
                        className="input-styled mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Fim do dia</Label>
                      <Input
                        type="time"
                        value={input.dayEndTime}
                        onChange={(e) => onUpdateInput({ dayEndTime: e.target.value })}
                        className="input-styled mt-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Commitments */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <SectionHeader 
            section="commitments" 
            icon={Clock} 
            title="Compromissos Fixos" 
            count={input.fixedCommitments.length}
          />
          <AnimatePresence>
            {expandedSection === 'commitments' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 space-y-4">
                  {/* Existing commitments */}
                  <AnimatePresence mode="popLayout">
                    {input.fixedCommitments.map((commitment) => {
                      const CategoryIcon = categoryConfig[commitment.category].icon;
                      return (
                        <motion.div
                          key={commitment.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50"
                        >
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{commitment.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {commitment.startTime} - {commitment.endTime}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemoveCommitment(commitment.id)}
                            className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Add new commitment */}
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <Input
                      placeholder="Ex: Trabalho, Aula de inglês..."
                      value={newCommitment.title}
                      onChange={(e) => setNewCommitment(prev => ({ ...prev, title: e.target.value }))}
                      className="input-styled"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={newCommitment.startTime}
                        onChange={(e) => setNewCommitment(prev => ({ ...prev, startTime: e.target.value }))}
                        className="input-styled"
                      />
                      <Input
                        type="time"
                        value={newCommitment.endTime}
                        onChange={(e) => setNewCommitment(prev => ({ ...prev, endTime: e.target.value }))}
                        className="input-styled"
                      />
                    </div>
                    <Select
                      value={newCommitment.category}
                      onValueChange={(value) => setNewCommitment(prev => ({ ...prev, category: value as ActivityCategory }))}
                    >
                      <SelectTrigger className="input-styled">
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
                        )))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleAddCommitment}
                      disabled={!newCommitment.title.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Compromisso
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Objectives */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <SectionHeader 
            section="objectives" 
            icon={Target} 
            title="Objetivos" 
            count={input.objectives.length}
          />
          <AnimatePresence>
            {expandedSection === 'objectives' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    O que você quer incluir na sua rotina?
                  </p>
                  <AnimatePresence mode="popLayout">
                    {input.objectives.map((objective, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-primary/5"
                      >
                        <Target className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="flex-1 text-sm">{objective}</span>
                        <button
                          onClick={() => onRemoveObjective(index)}
                          className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: 30 min de exercício..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddObjective()}
                      className="input-styled"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddObjective}
                      disabled={!newObjective.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Restrictions */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <SectionHeader 
            section="restrictions" 
            icon={AlertCircle} 
            title="Restrições" 
            count={input.restrictions.length}
          />
          <AnimatePresence>
            {expandedSection === 'restrictions' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Alguma restrição ou preferência especial?
                  </p>
                  <AnimatePresence mode="popLayout">
                    {input.restrictions.map((restriction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <span className="flex-1 text-sm">{restriction}</span>
                        <button
                          onClick={() => onRemoveRestriction(index)}
                          className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Não usar celular à noite..."
                      value={newRestriction}
                      onChange={(e) => setNewRestriction(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddRestriction()}
                      className="input-styled"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddRestriction}
                      disabled={!newRestriction.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-6 mt-auto">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Gerando sua rotina...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Rotina
            </>
          )}
        </button>
      </div>
    </div>
  );
}
