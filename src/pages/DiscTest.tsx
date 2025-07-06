
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, Brain } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: {
    value: string;
    text: string;
    type: 'D' | 'I' | 'S' | 'C';
  }[];
}

const DiscTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock questions - será substituído pelos dados reais da API
  const questions: Question[] = [
    {
      id: 1,
      text: "Em situações de trabalho, eu tendo a ser:",
      options: [
        { value: "assertive", text: "Assertivo e direto", type: "D" },
        { value: "enthusiastic", text: "Entusiástico e sociável", type: "I" },
        { value: "patient", text: "Paciente e estável", type: "S" },
        { value: "analytical", text: "Analítico e preciso", type: "C" }
      ]
    },
    {
      id: 2,
      text: "Quando enfrento desafios, eu:",
      options: [
        { value: "take_control", text: "Assumo o controle rapidamente", type: "D" },
        { value: "seek_support", text: "Busco apoio de outros", type: "I" },
        { value: "plan_carefully", text: "Planejo cuidadosamente", type: "S" },
        { value: "analyze_thoroughly", text: "Analiso minuciosamente", type: "C" }
      ]
    },
    // Mais perguntas serão adicionadas...
  ];

  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simular processamento
    setTimeout(() => {
      // Redirecionar para página de resultado
      window.location.href = '/resultado/disc/success';
    }, 2000);
  };

  const canProceed = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Teste DISC
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra seu perfil comportamental e como você se relaciona com o mundo ao seu redor.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Pergunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-xl">
              {questions[currentQuestion]?.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup 
              value={answers[currentQuestion] || ''} 
              onValueChange={handleAnswerChange}
              className="space-y-4"
            >
              {questions[currentQuestion]?.options.map((option, index) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="max-w-2xl mx-auto mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(prev - 1, 0))}
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
              'Processando...'
            ) : currentQuestion === totalQuestions - 1 ? (
              'Finalizar Teste'
            ) : (
              <>
                Próxima
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscTest;
