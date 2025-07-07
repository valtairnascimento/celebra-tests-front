import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, Heart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Question {
  _id: string;
  text: string;
  type: "Words" | "Acts" | "Gifts" | "Time" | "Touch";
}

const LoveTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; value: number }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!token) throw new Error("Token não fornecido na URL");

        const response = await fetch(
          `${API_BASE_URL}/love-languages/questions?token=${token}`
        );
        if (!response.ok) throw new Error("Erro ao carregar perguntas");

        const data = await response.json();
        setQuestions(data);

        const linkResponse = await fetch(
          `${API_BASE_URL}/love-languages/link?token=${token}`
        );
        if (!linkResponse.ok) throw new Error("Erro ao carregar nome do teste");

        const linkData = await linkResponse.json();
        setTestName(linkData.testName || "");
        setName(linkData.testName || "");
      } catch (err: any) {
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
  }, [token, toast]);

  const totalQuestions = questions.length || 0;
  const progress =
    totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const handleAnswerChange = (value: string) => {
    const numericValue = parseInt(value);
    if (isNaN(numericValue)) return;

    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = {
        questionId: questions[currentQuestion]._id,
        value: numericValue,
      };
      return updated;
    });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      if (answers.length !== totalQuestions)
        throw new Error("Por favor, responda todas as perguntas");

      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/love-languages/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, answers }),
      });

      if (!response.ok) throw new Error("Erro ao submeter teste");

      const data = await response.json();
      toast({
        title: "Teste concluído!",
        description: `Sua linguagem principal: ${data.primaryLanguage}`,
      });
      navigate(`/resultado/love/${data.resultId}`);
    } catch (err: any) {
      toast({
        title: "Erro ao submeter teste",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = !!answers[currentQuestion];

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
          Nenhuma pergunta disponível. Verifique o link ou contate o suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Linguagens do Amor - {testName || "Anônimo"}
          </h1>
          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            Descubra como você expressa e recebe amor de forma mais
            significativa.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-1 text-xs text-gray-600">
            <span>
              Pergunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <span className="text-purple-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card */}
        <Card className="max-w-xl mx-auto shadow-md text-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-md p-4">
            <CardTitle className="text-base">
              {questions[currentQuestion]?.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <RadioGroup
              value={answers[currentQuestion]?.value?.toString() || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <div
                  key={value}
                  className="flex items-center space-x-3 p-3 rounded border hover:bg-purple-50 transition-colors"
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

        {/* Navegação */}
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
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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

export default LoveTest;
