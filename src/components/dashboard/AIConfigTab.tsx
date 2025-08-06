import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Sparkles, Zap, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Settings {
  id: string;
  nome_ia: string;
  ia_ativa: boolean;
  openrouter_model: string;
}

export const AIConfigTab = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          nome_ia: settings.nome_ia,
          ia_ativa: settings.ia_ativa,
          openrouter_model: settings.openrouter_model,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações da IA salvas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="bg-gradient-to-r from-tech-blue/5 to-tech-green/5 border-tech-blue/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-tech-blue to-tech-green">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Status da Inteligência Artificial</CardTitle>
                <CardDescription>Configure e monitore o comportamento da IA</CardDescription>
              </div>
            </div>
            <Badge 
              variant={settings.ia_ativa ? "default" : "secondary"} 
              className={settings.ia_ativa ? "bg-tech-green text-white" : ""}
            >
              <Activity className="w-3 h-3 mr-1" />
              {settings.ia_ativa ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Label htmlFor="ia-status" className="text-base font-medium">
              Ativar IA do WhatsApp
            </Label>
            <Switch
              id="ia-status"
              checked={settings.ia_ativa}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, ia_ativa: checked })
              }
              className="data-[state=checked]:bg-tech-green"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Quando ativa, a IA responderá automaticamente às mensagens no WhatsApp
          </p>
        </CardContent>
      </Card>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-tech-purple" />
              <CardTitle>Nome da IA</CardTitle>
            </div>
            <CardDescription>
              Como a IA se apresentará aos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="nome-ia">Nome de apresentação</Label>
              <Input
                id="nome-ia"
                value={settings.nome_ia}
                onChange={(e) => 
                  setSettings({ ...settings, nome_ia: e.target.value })
                }
                placeholder="Ex: Atendente TechAI"
                className="transition-all duration-300 focus:scale-105"
              />
              <p className="text-xs text-muted-foreground">
                Este será o nome usado nas respostas automáticas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-tech-orange" />
              <CardTitle>Modelo da IA</CardTitle>
            </div>
            <CardDescription>
              Modelo OpenRouter utilizado para as respostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="modelo-ia">Modelo OpenRouter</Label>
              <Input
                id="modelo-ia"
                value={settings.openrouter_model}
                onChange={(e) => 
                  setSettings({ ...settings, openrouter_model: e.target.value })
                }
                placeholder="Ex: openai/gpt-4o"
                className="transition-all duration-300 focus:scale-105"
              />
              <p className="text-xs text-muted-foreground">
                Defina qual modelo será usado para gerar respostas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-tech-green" />
            <span>Métricas de Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-tech-blue/10">
              <p className="text-2xl font-bold text-tech-blue">94%</p>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-tech-green/10">
              <p className="text-2xl font-bold text-tech-green">1.2s</p>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-tech-purple/10">
              <p className="text-2xl font-bold text-tech-purple">47</p>
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-tech-orange/10">
              <p className="text-2xl font-bold text-tech-orange">1.2k</p>
              <p className="text-sm text-muted-foreground">Este Mês</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-tech-blue to-tech-green hover:from-tech-blue-dark hover:to-tech-green-dark transition-all duration-300 transform hover:scale-105"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};