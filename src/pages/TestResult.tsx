import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Brain, Heart, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultData {
  name: string;
  profile?: string;
  primaryLanguage?: string;
  scores: { [key: string]: number };
  date: string;
  description?: string;
}

const TestResult = () => {
  const [result, setResult] = useState<ResultData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { testType, resultId } = useParams<{
    testType: string;
    resultId: string;
  }>();
  const { toast } = useToast();

  const API_BASE_URL = "http://localhost:5000/api";

  const testMetadata = {
    disc: {
      icon: Brain,
      color: "from-red-500 to-red-600",
      description: (p: string) => `Você é predominantemente ${p}.`,
      characteristics: (p: string) =>
        ({
          Dominante: ["Foco", "Decisão", "Controle", "Desafio"],
          Influente: ["Comunicação", "Entusiasmo", "Inspiração", "Otimismo"],
          Estável: ["Paciência", "Estabilidade", "Colaboração", "Confiança"],
          Consciente: ["Análise", "Precisão", "Qualidade", "Detalhe"],
        }[p] || []),
    },
    "love-languages": {
      icon: Heart,
      color: "from-purple-500 to-pink-500",
      description: (p: string) => `Sua linguagem principal é ${p}.`,
      characteristics: (p: string) =>
        ({
          "Palavras de Afirmação": [
            "Elogios",
            "Reconhecimento",
            "Apoio verbal",
            "Encorajamento",
          ],
          "Atos de Serviço": ["Ajuda prática", "Ações", "Favores", "Cuidados"],
          Presentes: ["Gestos", "Lembranças", "Surpresas", "Simbolismo"],
          "Tempo de Qualidade": [
            "Presença",
            "Conexão",
            "Atenção",
            "Momentos juntos",
          ],
          "Toque Físico": ["Contato", "Afeto", "Carinho", "Proximidade"],
        }[p] || []),
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint =
          testType === "disc"
            ? `disc/result/${resultId}`
            : `love-languages/report/${resultId}`;
        const res = await fetch(`${API_BASE_URL}/${endpoint}`);

        if (!res.ok) throw new Error("Erro ao buscar resultado");
        const contentType = res.headers.get("content-type");

        if (contentType?.includes("pdf")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setResult({
            name: "Desconhecido",
            scores: {},
            date: new Date().toISOString(),
          });
        } else {
          const data = await res.json();
          setResult(data);
        }
      } catch (e: any) {
        setError(e.message);
        toast({
          title: "Erro",
          description: e.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testType, resultId]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  if (error || !result || !testMetadata[testType as keyof typeof testMetadata])
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        {error || "Erro"}
      </div>
    );

  const meta = testMetadata[testType as keyof typeof testMetadata];
  const Icon = meta.icon;
  const profile = result.profile || result.primaryLanguage || "Desconhecido";
  const total = Object.values(result.scores).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="bg-green-500 p-2 rounded-full">
              <CheckCircle className="text-white w-6 h-6" />
            </div>
          </div>
          <h1 className="text-xl font-bold">Resultado</h1>
          <p className="text-gray-600 text-sm">Confira seu perfil abaixo</p>
        </div>

        <Card className="text-sm">
          <CardHeader
            className={`bg-gradient-to-r ${meta.color} text-white p-3`}
          >
            <div className="flex justify-center mb-1">
              <Icon className="w-6 h-6" />
            </div>
            <CardTitle className="text-center text-base font-medium">
              {profile}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-1 text-gray-700">Sobre</h3>
              <p className="text-gray-600">{meta.description(profile)}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-gray-700">
                Características
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-gray-600 text-sm">
                {meta.characteristics(profile).map((c, i) => (
                  <li key={i} className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 bg-gradient-to-r ${meta.color}`}
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-gray-700">Distribuição</h3>
              <div className="space-y-2">
                {Object.entries(result.scores).map(([k, v]) => {
                  const pct = total ? Math.round((v / total) * 100) : 0;
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-24 capitalize">{k}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded">
                        <div
                          className={`h-full bg-gradient-to-r ${meta.color} rounded`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* {pdfUrl && (
              <div className="text-center mt-4">
                <Button asChild size="sm">
                  <a href={pdfUrl} download={`resultado_${testType}_${resultId}.pdf`}>
                    Baixar PDF
                  </a>
                </Button>
              </div>
            )} */}

            <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded text-center">
              <h4 className="font-medium text-gray-800 mb-1 sm:text-lg">
                Obrigado por participar!
              </h4>
              <p className="text-gray-600 text-sm sm:text-base">
                Agora cadastre seu curriculo em nosso banco de bla bla bla
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResult;
