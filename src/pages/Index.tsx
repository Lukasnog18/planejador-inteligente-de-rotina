import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { RoutinePlanner } from '@/components/RoutinePlanner';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

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

  // Only render RoutinePlanner when authenticated
  return <RoutinePlanner />;
};

export default Index;
