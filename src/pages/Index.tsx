import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, Brain, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-tech-blue to-tech-green mb-6 shadow-xl">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-tech-blue to-tech-green bg-clip-text text-transparent">
            Assistente Técnico IA
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema inteligente de atendimento via WhatsApp para assistências técnicas.
            Automatize consultas de produtos e agilize o atendimento aos clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-to-r from-tech-blue to-tech-green hover:from-tech-blue-dark hover:to-tech-green-dark text-lg px-8 py-3">
              <Link to="/auth">
                Acessar Painel Admin
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-tech-blue/10 to-tech-blue/5 border-tech-blue/20">
            <CardHeader>
              <Brain className="w-12 h-12 text-tech-blue mb-4" />
              <CardTitle>Inteligência Artificial</CardTitle>
              <CardDescription>
                IA avançada que interpreta mensagens e consulta produtos automaticamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-tech-green/10 to-tech-green/5 border-tech-green/20">
            <CardHeader>
              <MessageSquare className="w-12 h-12 text-tech-green mb-4" />
              <CardTitle>WhatsApp Integrado</CardTitle>
              <CardDescription>
                Atendimento automatizado via WhatsApp com Evolution API 2
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-tech-purple/10 to-tech-purple/5 border-tech-purple/20">
            <CardHeader>
              <Zap className="w-12 h-12 text-tech-purple mb-4" />
              <CardTitle>Gestão Completa</CardTitle>
              <CardDescription>
                Painel administrativo para produtos, configurações e relatórios
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
