import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: isLogin ? 'Erro ao entrar' : 'Erro ao criar conta',
          description: error.message,
          variant: 'destructive',
        });
      } else if (!isLogin) {
        toast({
          title: 'Conta criada!',
          description: 'Você já pode começar a usar o planejador.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Algo deu errado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="panel-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⏰
              </motion.div>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Planejador Inteligente
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Entre para acessar suas rotinas' : 'Crie sua conta para começar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input-styled pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Senha
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-styled pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isLogin ? (
                <LogIn className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? (
                <>Não tem conta? <span className="text-primary font-medium">Criar conta</span></>
              ) : (
                <>Já tem conta? <span className="text-primary font-medium">Entrar</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
