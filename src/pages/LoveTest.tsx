import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserInfoModal from "@/components/UserInfoModal";

interface Question {
  _id: string;
  text: string;
  type: "Words" | "Acts" | "Gifts" | "Time" | "Touch";
}

const LoveTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; value: number }[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError("Token não fornecido");
        setLoading(false);
        return;
      }

      try {
        const resQuestions = await fetch(`${API_BASE_URL}/love-languages/questions?token=${token}`);
        if (!resQuestions.ok) throw new Error("Erro ao carregar perguntas");
        const dataQuestions = await resQuestions.json();
        setQuestions(dataQuestions);

        const resLink = await fetch(`${API_BASE_URL}/love-languages/link?token=${token}`);
        if (!resLink.ok) throw new Error("Erro ao carregar link do teste");
        const linkData = await resLink.json();

        setTestName(linkData.testName || "");
        if (!linkData.testName) {
          setShowUserModal(true);
        }
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
  }, [token]);

  const handleUserInfoSubmit = async ({ name, email, phone }: { name: string; email: string; phone: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/love-languages/update-user-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, email, phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar dados do usuário");
      }

      setTestName(name);
      setShowUserModal(false);
    } catch (err) {
      toast({
        title: "Erro ao salvar dados",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = {
      questionId: questions[currentQuestion]._id,
      value: parseInt(value),
    };
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (answers.length !== questions.length) {
      toast({
        title: "Responda todas as perguntas",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/love-languages/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: testName || "Participante",
          answers,
        }),
      });

      if (!response.ok) throw new Error("Erro ao submeter teste");

      const data = await response.json();
      toast({
        title: "Teste concluído!",
        description: `Linguagem principal: ${data.primaryLanguage}`,
      });
      navigate(`/resultado/love-languages/${data.resultId}`);
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
      <div className="min-h-screen flex items-center justify-center">Carregando...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Nenhuma pergunta disponível.
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-purple-600 p-2 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Linguagens do Amor - {testName || "Participante"}
          </h1>
          <p className="text-gray-600 text-sm">
            Descubra sua linguagem emocional predominante.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-purple-600">{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card className="max-w-xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-md">
            <CardTitle className="text-base">
              {questions[currentQuestion].text}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <RadioGroup
              value={answers[currentQuestion]?.value?.toString() || ""}
              onValueChange={handleAnswerChange}
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <div
                  key={v}
                  className="flex items-center space-x-3 p-3 border rounded hover:bg-purple-50"
                >
                  <RadioGroupItem value={v.toString()} id={`option-${v}`} />
                  <Label htmlFor={`option-${v}`} className="flex-1 cursor-pointer">
                    {["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"][v - 1]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

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
            {isSubmitting
              ? "Enviando..."
              : currentQuestion === questions.length - 1
              ? "Finalizar Teste"
              : (
                <>
                  Próxima <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
          </Button>
        </div>
      </div>

      <UserInfoModal isOpen={showUserModal} onSubmit={handleUserInfoSubmit} />
    </div>
  );
};

export default LoveTest;
