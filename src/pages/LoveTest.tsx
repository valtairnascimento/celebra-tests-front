
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, Heart } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: {
    value: string;
    text: string;
    type: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
  }[];
}

const LoveTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock questions - será substituído pelos dados reais da API
  const questions: Question[] = [
    {
      id: 1,
      text: "O que mais te faz sentir amado(a)?",
      options: [
        { value: "compliments", text: "Receber elogios e palavras carinhosas", type: "words" },
        { value: "help", text: "Quando alguém me ajuda com tarefas", type: "acts" },
        { value: "surprise", text: "Ganhar presentes inesperados", type: "gifts" },
        { value: "attention", text: "Ter atenção exclusiva de quem amo", type: "time" },
        { value: "affection", text: "Receber abraços e carinhos", type: "touch" }
      ]
    },
    {
      id: 2,
      text: "Como você prefere demonstrar amor?",
      options: [
        { value: "express_feelings", text: "Expressando meus sentimentos com palavras", type: "words" },
        { value: "do_favors", text: "Fazendo favores e ajudando", type: "acts" },
        { value: "give_gifts", text: "Dando presentes especiais", type: "gifts" },
        { value: "spend_time", text: "Passando tempo de qualidade junto", type: "time" },
        { value: "physical_contact", text: "Através do contato físico", type: "touch" }
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
      window.location.href = '/resultado/love/success';
    }, 2000);
  };

  const canProceed = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Linguagens de Amor
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra como você expressa e recebe amor de forma mais significativa.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Pergunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
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
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-purple-50 transition-colors">
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
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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

export default LoveTest;
