import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Users } from "lucide-react";
import TestTable from "@/components/TestTable";
import GenerateLinkModal from "@/components/GenerateLinkModal";

const Dashboard = () => {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [activeTestType, setActiveTestType] = useState<"disc" | "love">("disc");
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    discTestsThisMonth: 0,
    loveTestsThisMonth: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/metrics`);
        if (!response.ok) throw new Error("Erro ao buscar métricas");
        const data = await response.json();
        setMetrics({
          totalUsers: data.totalUsers,
          discTestsThisMonth: data.discTestsThisMonth,
          loveTestsThisMonth: data.loveTestsThisMonth,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Painel Administrativo
              </h1>
              <p className="text-gray-600">Testes DISC e Linguagens de Amor</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setActiveTestType("disc");
                  setIsGenerateModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Gerar Teste DISC
              </Button>
              <Button
                onClick={() => {
                  setActiveTestType("love");
                  setIsGenerateModalOpen(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Gerar Teste Linguagens
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Testes DISC</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Carregando..." : metrics.discTestsThisMonth}
              </div>
              <p className="text-xs opacity-80">Realizados este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Linguagens de Amor
              </CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Carregando..." : metrics.loveTestsThisMonth}
              </div>
              <p className="text-xs opacity-80">Realizados este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Usuários
              </CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Carregando..." : metrics.totalUsers}
              </div>
              <p className="text-xs opacity-80">Cadastrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="disc" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="disc"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Testes DISC
                </TabsTrigger>
                <TabsTrigger
                  value="love"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Linguagens de Amor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="disc">
                <TestTable testType="disc" />
              </TabsContent>

              <TabsContent value="love">
                <TestTable testType="love" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <GenerateLinkModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          testType={activeTestType}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            Erro: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
