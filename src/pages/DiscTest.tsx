import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, Brain } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Question {
  _id: string;
  text: string;
  type: "D" | "I" | "S" | "C";
}

const DiscTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError("Token não fornecido na URL");
        setLoading(false);
        toast({
          title: "Erro",
          description: "Token não fornecido na URL",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/disc/questions?token=${token}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao carregar perguntas");
        }

        const data = await response.json();
        setQuestions(data);

        const testLinkResponse = await fetch(
          `${API_BASE_URL}/disc/test-link?token=${token}`
        );
        if (!testLinkResponse.ok) {
          const errorData = await testLinkResponse.json();
          throw new Error(errorData.error || "Erro ao buscar nome do teste");
        }

        const { testName } = await testLinkResponse.json();
        setTestName(testName || "DISC");
      } catch (err) {
        setError(err.message);
        toast({
          title: "Erro ao carregar teste",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  const totalQuestions = questions.length || 0;
  const progress =
    totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion]._id]: parseInt(value),
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: "Erro",
        description:
          "Token não fornecido. Por favor, acesse o teste com um link válido.",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(answers).length !== totalQuestions) {
      toast({
        title: "Erro",
        description: "Por favor, responda todas as perguntas antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        name: testName,
        token,
      };

      const response = await fetch(`${API_BASE_URL}/disc/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao submeter teste");
      }

      const { resultId, profile } = await response.json();
      toast({
        title: "Teste concluído!",
        description: `Seu perfil principal: ${profile}`,
      });
      navigate(`/resultado/disc/${resultId}`);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Erro ao submeter teste",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = answers[questions[currentQuestion]?._id] !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando teste...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-100 text-red-700 rounded">Erro: {error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>
          Nenhuma pergunta disponível. Por favor, verifique o token ou contate o
          suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-full">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Teste DISC - {testName || "Anônimo"}
          </h1>
          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            Descubra seu perfil comportamental e como você se relaciona com o
            mundo ao seu redor.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-1 text-xs text-gray-600">
            <span>
              Pergunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <span className="text-blue-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="max-w-xl mx-auto shadow-md text-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-md p-4">
            <CardTitle className="text-base">
              {questions[currentQuestion]?.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <RadioGroup
              value={answers[questions[currentQuestion]?._id]?.toString() || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <div
                  key={value}
                  className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem
                    value={value.toString()}
                    id={`value-${value}`}
                  />
                  <Label
                    htmlFor={`value-${value}`}
                    className="flex-1 cursor-pointer"
                  >
                    {(() => {
                      switch (value) {
                        case 1:
                          return "Discordo totalmente";
                        case 2:
                          return "Discordo";
                        case 3:
                          return "Neutro";
                        case 4:
                          return "Concordo";
                        case 5:
                          return "Concordo totalmente";
                        default:
                          return "";
                      }
                    })()}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="max-w-xl mx-auto mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isSubmitting ? (
              "Processando..."
            ) : currentQuestion === totalQuestions - 1 ? (
              "Finalizar Teste"
            ) : (
              <>
                Próxima <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscTest;
