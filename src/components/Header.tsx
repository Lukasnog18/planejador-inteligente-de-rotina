import React from 'react';
import { Clock, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, signOut } = useAuth();

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

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
