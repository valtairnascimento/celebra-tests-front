import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserInfoModal from "@/components/UserInfoModal";

interface Question {
  _id: string;
  text: string;
  type: "D" | "I" | "S" | "C";
}

const DiscTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

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
        const questionsRes = await fetch(`${API_BASE_URL}/disc/questions?token=${token}`);
        if (!questionsRes.ok) throw new Error("Erro ao carregar perguntas");
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);

        const linkRes = await fetch(`${API_BASE_URL}/disc/test-link?token=${token}`);
        if (!linkRes.ok) throw new Error("Erro ao buscar informações do teste");
        const linkData = await linkRes.json();

        setTestName(linkData.testName || "");
        if (!linkData.testName) {
          setShowUserModal(true);
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Erro",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  const handleUserInfoSubmit = async ({
    name,
    email,
    phone,
  }: {
    name: string;
    email: string;
    phone: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/disc/update-user-info`, {
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
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion]._id]: parseInt(value),
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Responda todas as perguntas",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        token,
        name: testName || "Anônimo",
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
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

      const data = await response.json();
      toast({
        title: "Teste concluído",
        description: `Seu perfil: ${data.profile}`,
      });
      navigate(`/resultado/disc/${data.resultId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
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
  const canProceed = answers[questions[currentQuestion]?._id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Teste DISC - {testName || "Participante"}
          </h1>
          <p className="text-gray-600 text-sm">
            Descubra seu perfil comportamental.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-blue-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <Card className="max-w-xl mx-auto">
          <CardHeader className="bg-blue-600 text-white rounded-t p-4">
            <CardTitle className="text-base">{questions[currentQuestion].text}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <RadioGroup
              value={answers[questions[currentQuestion]._id]?.toString() || ""}
              onValueChange={handleAnswerChange}
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <div
                  key={v}
                  className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50"
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
            className="bg-blue-600 hover:bg-blue-700"
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

      {/* Modal de dados do usuário */}
      <UserInfoModal isOpen={showUserModal} onSubmit={handleUserInfoSubmit} />
    </div>
  );
};

export default DiscTest;
