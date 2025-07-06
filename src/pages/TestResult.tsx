
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Brain, Heart, Award } from 'lucide-react';

const TestResult = () => {
  const { testType, resultId } = useParams();
  
  // Mock data - será substituído pelos dados reais da API
  const resultData = {
    disc: {
      mainProfile: 'Dominante',
      description: 'Você é uma pessoa focada em resultados, decisiva e orientada para metas. Gosta de assumir responsabilidades e prefere ambientes desafiadores.',
      characteristics: [
        'Orientado para resultados',
        'Assumir controle',
        'Tomar decisões rápidas',
        'Aceitar desafios'
      ],
      color: 'from-red-500 to-red-600',
      icon: Brain,
      percentage: 85
    },
    love: {
      mainProfile: 'Palavras de Afirmação',
      description: 'Você se sente mais amado quando recebe palavras encorajadoras, elogios sinceros e expressões verbais de carinho.',
      characteristics: [
        'Valoriza elogios sinceros',
        'Aprecia palavras de encorajamento',
        'Gosta de ouvir "eu te amo"',
        'Se motiva com reconhecimento verbal'
      ],
      color: 'from-purple-500 to-pink-500',
      icon: Heart,
      percentage: 92
    }
  };

  const currentResult = resultData[testType as keyof typeof resultData];
  const IconComponent = currentResult?.icon;

  if (!currentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Resultado não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Parabéns! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seu teste foi finalizado com sucesso. Confira seu resultado abaixo.
          </p>
        </div>

        {/* Result Card */}
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader className={`bg-gradient-to-r ${currentResult.color} text-white rounded-t-lg`}>
            <div className="flex items-center justify-center mb-4">
              {IconComponent && <IconComponent className="h-16 w-16" />}
            </div>
            <CardTitle className="text-3xl text-center">
              {currentResult.mainProfile}
            </CardTitle>
            <div className="flex items-center justify-center mt-4">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                {currentResult.percentage}% de compatibilidade
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-500" />
                Seu Perfil
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {currentResult.description}
              </p>
            </div>

            {/* Characteristics */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Principais Características
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentResult.characteristics.map((characteristic, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentResult.color} mr-3`} />
                    <span className="text-gray-700">{characteristic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Thank you message */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Obrigado por participar!
              </h4>
              <p className="text-gray-600">
                Esperamos que este teste tenha fornecido insights valiosos sobre seu perfil. 
                Continue sua jornada de autoconhecimento!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResult;
