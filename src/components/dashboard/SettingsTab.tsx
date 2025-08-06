import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Scale, Save, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Settings {
  id: string;
  balanca_status: string;
  balanca_modelo: string;
}

export const SettingsTab = () => {
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
          balanca_status: settings.balanca_status,
          balanca_modelo: settings.balanca_modelo,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-tech-blue" />
          Configurações Gerais
        </h2>
        <p className="text-muted-foreground">
          Configurações adicionais do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="w-6 h-6 text-tech-green" />
              <div>
                <CardTitle>Balança</CardTitle>
                <CardDescription>Status e modelo da balança conectada</CardDescription>
              </div>
            </div>
            <Badge variant={settings?.balanca_status === 'Conectado' ? "default" : "secondary"}>
              {settings?.balanca_status === 'Conectado' ? (
                <><CheckCircle className="w-3 h-3 mr-1" />Conectado</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" />Desconectado</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balanca-status">Status da Balança</Label>
              <Input
                id="balanca-status"
                value={settings?.balanca_status || ''}
                onChange={(e) => settings && setSettings({ ...settings, balanca_status: e.target.value })}
                placeholder="Conectado / Desconectado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balanca-modelo">Modelo da Balança</Label>
              <Input
                id="balanca-modelo"
                value={settings?.balanca_modelo || ''}
                onChange={(e) => settings && setSettings({ ...settings, balanca_modelo: e.target.value })}
                placeholder="Ex: Toledo Prix 3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-tech-blue to-tech-green"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};