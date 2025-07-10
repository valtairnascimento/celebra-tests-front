
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Download, Check, X, Loader2, Sparkles, Bot } from 'lucide-react';

interface ResumeSuggestion {
  id: string;
  text: string;
  accepted: boolean;
  rejected: boolean;
}

interface ResumeResponse {
  originalText: string;
  suggestions: string[];
  iaSuggestion: string;
}

const ResumeEnhancer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>([]);
  const [iaSuggestion, setIaSuggestion] = useState('');
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos PDF ou DOCX.",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Simulando chamada para o backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados mockados - substitua pela chamada real da API
      const mockResponse: ResumeResponse = {
        originalText: `João Silva
Desenvolvedor Full Stack

EXPERIÊNCIA PROFISSIONAL
- Desenvolvedor na Empresa XYZ (2020-2023)
- Trabalhou com React e Node.js
- Participou de projetos importantes

EDUCAÇÃO
- Graduação em Ciência da Computação
- Universidade ABC (2016-2020)

HABILIDADES
- JavaScript, React, Node.js
- HTML, CSS
- Git`,
        suggestions: [
          "Adicione métricas quantificáveis às suas experiências (ex: 'Aumentou a performance em 30%')",
          "Inclua palavras-chave relevantes como 'TypeScript', 'MongoDB', 'Docker'",
          "Adicione uma seção de projetos pessoais para destacar suas iniciativas",
          "Melhore a descrição das responsabilidades com verbos de ação",
          "Inclua certificações ou cursos relevantes na área"
        ],
        iaSuggestion: "Seu currículo possui uma boa estrutura básica, mas pode ser significativamente melhorado com métricas específicas e palavras-chave da indústria. Recomendo expandir a seção de experiências com resultados quantificáveis e adicionar uma seção de projetos que demonstre suas habilidades práticas."
      };

      setOriginalText(mockResponse.originalText);
      setEditedText(mockResponse.originalText);
      setSuggestions(mockResponse.suggestions.map((text, index) => ({
        id: `suggestion-${index}`,
        text,
        accepted: false,
        rejected: false
      })));
      setIaSuggestion(mockResponse.iaSuggestion);
      setShowResults(true);

      toast({
        title: "Currículo processado com sucesso!",
        description: "Análise concluída. Confira as sugestões abaixo."
      });
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o currículo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = (suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, accepted: true } : s)
    );
    toast({
      title: "Sugestão aceita",
      description: "A sugestão foi aplicada ao seu currículo."
    });
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, rejected: true } : s)
    );
  };

  const handleExportText = () => {
    const blob = new Blob([editedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curriculo-melhorado.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setOriginalText('');
    setEditedText('');
    setSuggestions([]);
    setIaSuggestion('');
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Melhorador de Currículo IA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Faça upload do seu currículo e receba sugestões inteligentes para destacar suas qualificações
          </p>
        </div>

        {!showResults ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload do Currículo
              </CardTitle>
              <CardDescription>
                Envie seu currículo em formato PDF ou DOCX (máximo 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume-file">Selecionar arquivo</Label>
                <Input
                  id="resume-file"
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{file.name}</span>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!file || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analisar Currículo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor de Texto */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Seu Currículo</CardTitle>
                  <CardDescription>
                    Edite seu currículo abaixo aplicando as sugestões
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Seu currículo aparecerá aqui..."
                  />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleExportText} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Texto
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      Novo Currículo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel de Sugestões */}
            <div className="space-y-6">
              {/* Sugestão da IA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    Análise da IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {iaSuggestion}
                  </p>
                </CardContent>
              </Card>

              {/* Lista de Sugestões */}
              <Card>
                <CardHeader>
                  <CardTitle>Sugestões de Melhoria</CardTitle>
                  <CardDescription>
                    {suggestions.filter(s => !s.rejected).length} sugestões disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.filter(s => !s.rejected).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`p-3 rounded-lg border transition-all ${
                        suggestion.accepted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <p className="text-sm text-gray-700 mb-3">
                        {suggestion.text}
                      </p>
                      {!suggestion.accepted && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptSuggestion(suggestion.id)}
                            className="h-7"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                            className="h-7"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                      {suggestion.accepted && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="h-3 w-3" />
                          <span className="text-xs font-medium">Aplicada</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeEnhancer;
