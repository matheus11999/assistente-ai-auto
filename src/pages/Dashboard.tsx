import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsEnhanced, TabsListEnhanced, TabsTriggerEnhanced, TabsContentEnhanced } from '@/components/ui/tabs-enhanced';
import { toast } from '@/hooks/use-toast';
import { Bot, Settings, Package, MessageSquare, LogOut, Brain, Zap, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { User, Session } from '@supabase/supabase-js';
import { AIConfigTab } from '@/components/dashboard/AIConfigTab';
import { APIConfigTab } from '@/components/dashboard/APIConfigTab';
import { ProductsTab } from '@/components/dashboard/ProductsTab';
import { LogsTab } from '@/components/dashboard/LogsTab';
import { SettingsTab } from '@/components/dashboard/SettingsTab';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tech-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-tech-blue to-tech-green shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-tech-blue to-tech-green bg-clip-text text-transparent">
                  Assistente Técnico IA
                </h1>
                <p className="text-sm text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-tech-blue/30 hover:bg-tech-blue/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-tech-blue/10 to-tech-blue/5 border-tech-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status da IA</p>
                  <p className="text-2xl font-bold text-tech-blue">Ativo</p>
                </div>
                <Brain className="w-8 h-8 text-tech-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-tech-green/10 to-tech-green/5 border-tech-green/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                  <p className="text-2xl font-bold text-tech-green">25</p>
                </div>
                <Package className="w-8 h-8 text-tech-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-tech-purple/10 to-tech-purple/5 border-tech-purple/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mensagens Hoje</p>
                  <p className="text-2xl font-bold text-tech-purple">47</p>
                </div>
                <MessageSquare className="w-8 h-8 text-tech-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-tech-orange/10 to-tech-orange/5 border-tech-orange/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-tech-orange">94%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-tech-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
          <CardContent className="p-6">
            <TabsEnhanced defaultValue="ai" className="w-full">
              <TabsListEnhanced className="grid grid-cols-5 mb-6 bg-muted/30">
                <TabsTriggerEnhanced value="ai" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  IA
                </TabsTriggerEnhanced>
                <TabsTriggerEnhanced value="apis" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  APIs
                </TabsTriggerEnhanced>
                <TabsTriggerEnhanced value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Produtos
                </TabsTriggerEnhanced>
                <TabsTriggerEnhanced value="logs" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Logs
                </TabsTriggerEnhanced>
                <TabsTriggerEnhanced value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Config.
                </TabsTriggerEnhanced>
              </TabsListEnhanced>

              <TabsContentEnhanced value="ai">
                <AIConfigTab />
              </TabsContentEnhanced>

              <TabsContentEnhanced value="apis">
                <APIConfigTab />
              </TabsContentEnhanced>

              <TabsContentEnhanced value="products">
                <ProductsTab />
              </TabsContentEnhanced>

              <TabsContentEnhanced value="logs">
                <LogsTab />
              </TabsContentEnhanced>

              <TabsContentEnhanced value="settings">
                <SettingsTab />
              </TabsContentEnhanced>
            </TabsEnhanced>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;