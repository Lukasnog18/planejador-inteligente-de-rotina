import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Planejador Inteligente
                <Sparkles className="w-4 h-4 text-accent" />
              </h1>
              <p className="text-sm text-muted-foreground">
                Organize sua rotina de forma inteligente
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
