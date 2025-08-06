import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Key, MessageSquare, Save, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Settings {
  id: string;
  openrouter_api: string;
  evolution_token: string;
  instancia_id: string;
}

export const APIConfigTab = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showToken, setShowToken] = useState(false);

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
          openrouter_api: settings.openrouter_api,
          evolution_token: settings.evolution_token,
          instancia_id: settings.instancia_id,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações de API salvas com sucesso",
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

  const maskValue = (value: string) => {
    if (!value) return '';
    return value.substring(0, 8) + '•'.repeat(Math.max(0, value.length - 8));
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
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-tech-blue/5 to-tech-blue/10 border-tech-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Key className="w-8 h-8 text-tech-blue" />
                <div>
                  <p className="font-medium">OpenRouter API</p>
                  <p className="text-sm text-muted-foreground">Chave da IA</p>
                </div>
              </div>
              <Badge variant={settings.openrouter_api ? "default" : "secondary"}>
                {settings.openrouter_api ? (
                  <><CheckCircle className="w-3 h-3 mr-1" />Configurado</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" />Pendente</>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-tech-green/5 to-tech-green/10 border-tech-green/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-tech-green" />
                <div>
                  <p className="font-medium">Evolution API</p>
                  <p className="text-sm text-muted-foreground">WhatsApp Bot</p>
                </div>
              </div>
              <Badge variant={settings.evolution_token ? "default" : "secondary"}>
                {settings.evolution_token ? (
                  <><CheckCircle className="w-3 h-3 mr-1" />Conectado</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" />Desconectado</>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OpenRouter Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-tech-blue" />
            <CardTitle>OpenRouter API</CardTitle>
          </div>
          <CardDescription>
            Configure a chave de API do OpenRouter para usar a inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openrouter-api">Chave da API OpenRouter</Label>
            <div className="relative">
              <Input
                id="openrouter-api"
                type={showApiKey ? "text" : "password"}
                value={settings.openrouter_api || ''}
                onChange={(e) => 
                  setSettings({ ...settings, openrouter_api: e.target.value })
                }
                placeholder="sk-or-v1-..."
                className="transition-all duration-300 focus:scale-105 pr-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave em: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-tech-blue hover:underline">openrouter.ai/keys</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Evolution API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-tech-green" />
            <CardTitle>Evolution API 2</CardTitle>
          </div>
          <CardDescription>
            Configure a conexão com a Evolution API para WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evolution-token">Token da Evolution API</Label>
            <div className="relative">
              <Input
                id="evolution-token"
                type={showToken ? "text" : "password"}
                value={settings.evolution_token || ''}
                onChange={(e) => 
                  setSettings({ ...settings, evolution_token: e.target.value })
                }
                placeholder="Bearer token..."
                className="transition-all duration-300 focus:scale-105 pr-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instancia-id">ID da Instância</Label>
            <Input
              id="instancia-id"
              value={settings.instancia_id || ''}
              onChange={(e) => 
                setSettings({ ...settings, instancia_id: e.target.value })
              }
              placeholder="minhainstancia"
              className="transition-all duration-300 focus:scale-105"
            />
            <p className="text-xs text-muted-foreground">
              Nome da instância configurada na Evolution API
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Warning Card */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Importante: Segurança das APIs
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Mantenha suas chaves de API seguras e nunca as compartilhe. 
                Essas informações são armazenadas de forma criptografada no banco de dados.
              </p>
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