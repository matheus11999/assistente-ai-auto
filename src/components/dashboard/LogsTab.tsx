import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Clock, User, Bot, Search, BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LogMessage {
  id: string;
  numero_usuario: string;
  mensagem_usuario: string;
  resposta_ia: string;
  timestamp: string;
}

export const LogsTab = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogMessage | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('logs_mensagens')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  const filteredLogs = logs.filter(log =>
    log.numero_usuario.includes(searchTerm) ||
    log.mensagem_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.resposta_ia && log.resposta_ia.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-tech-purple" />
            Logs de Atendimento
          </h2>
          <p className="text-muted-foreground">
            Histórico de conversas entre clientes e a IA
          </p>
        </div>

        <Button 
          onClick={fetchLogs}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-tech-blue/10 to-tech-blue/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-tech-blue">{logs.length}</p>
            <p className="text-sm text-muted-foreground">Total de Mensagens</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-tech-green/10 to-tech-green/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-tech-green">
              {logs.filter(log => log.resposta_ia).length}
            </p>
            <p className="text-sm text-muted-foreground">Respondidas pela IA</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-tech-purple/10 to-tech-purple/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-tech-purple">
              {new Set(logs.map(log => log.numero_usuario)).size}
            </p>
            <p className="text-sm text-muted-foreground">Usuários Únicos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-tech-orange/10 to-tech-orange/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-tech-orange">
              {logs.filter(log => {
                const today = new Date();
                const logDate = new Date(log.timestamp);
                return logDate.toDateString() === today.toDateString();
              }).length}
            </p>
            <p className="text-sm text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por número, mensagem ou resposta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Conversas Recentes</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <Card 
                key={log.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedLog?.id === log.id ? 'ring-2 ring-tech-blue' : ''
                }`}
                onClick={() => setSelectedLog(log)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-tech-blue" />
                      <span className="font-medium text-sm">
                        {formatPhoneNumber(log.numero_usuario)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <p className="line-clamp-2">{log.mensagem_usuario}</p>
                    </div>
                    {log.resposta_ia && (
                      <div className="bg-tech-blue/10 p-2 rounded text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="w-3 h-3 text-tech-blue" />
                          <span className="text-xs font-medium text-tech-blue">IA Respondeu</span>
                        </div>
                        <p className="line-clamp-2">{log.resposta_ia}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredLogs.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum log encontrado' : 'Nenhum log disponível'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Detailed View */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Detalhes da Conversa</h3>
          {selectedLog ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-tech-blue" />
                    {formatPhoneNumber(selectedLog.numero_usuario)}
                  </CardTitle>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(selectedLog.timestamp)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Mensagem do Cliente
                  </Label>
                  <Textarea
                    value={selectedLog.mensagem_usuario}
                    readOnly
                    className="mt-1 bg-muted/50"
                    rows={3}
                  />
                </div>

                {selectedLog.resposta_ia && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Bot className="w-4 h-4 text-tech-blue" />
                      Resposta da IA
                    </Label>
                    <Textarea
                      value={selectedLog.resposta_ia}
                      readOnly
                      className="mt-1 bg-tech-blue/5 border-tech-blue/20"
                      rows={4}
                    />
                  </div>
                )}

                {!selectedLog.resposta_ia && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Esta mensagem não foi respondida pela IA automaticamente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma conversa para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      {children}
    </label>
  );
}