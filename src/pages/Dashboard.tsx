import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Plus, Pencil, Trash } from "lucide-react";

interface Test {
  id: string;
  name: string;
  type: string;
  link: string;
  created_at: string;
}

const Dashboard = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [newTestName, setNewTestName] = useState("");
  const [newTestType, setNewTestType] = useState("disc");
  const [editTestId, setEditTestId] = useState<string | null>(null);
  const [editTestName, setEditTestName] = useState("");
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: "1",
          name: "Teste de Personalidade DISC",
          type: "disc",
          link: "/test/disc/1",
          created_at: "2024-05-01T10:00:00Z",
        },
        {
          id: "2",
          name: "Teste de Linguagens do Amor",
          type: "love-languages",
          link: "/test/love-languages/2",
          created_at: "2024-05-02T14:30:00Z",
        },
      ];
    },
  });

  useEffect(() => {
    if (data) {
      setTests(data);
    }
  }, [data]);

  const createTestMutation = useMutation(
    async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newTest = {
        id: String(Date.now()),
        name: newTestName,
        type: newTestType,
        link: `/test/${newTestType}/${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      return newTest;
    },
    {
      onSuccess: (newTest) => {
        setTests([...tests, newTest]);
        setNewTestName("");
        setNewTestType("disc");
        queryClient.invalidateQueries({ queryKey: ["tests"] });
        toast({
          title: "Teste criado",
          description: "Novo teste foi criado com sucesso.",
        });
      },
      onError: () => {
        toast({
          title: "Erro ao criar teste",
          description: "Houve um problema ao criar o teste.",
          variant: "destructive",
        });
      },
    }
  );

  const updateTestMutation = useMutation(
    async (testId: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return testId;
    },
    {
      onSuccess: (testId) => {
        setTests(
          tests.map((test) =>
            test.id === testId ? { ...test, name: editTestName } : test
          )
        );
        setEditTestId(null);
        setEditTestName("");
        queryClient.invalidateQueries({ queryKey: ["tests"] });
        toast({
          title: "Teste atualizado",
          description: "Teste foi atualizado com sucesso.",
        });
      },
      onError: () => {
        toast({
          title: "Erro ao atualizar teste",
          description: "Houve um problema ao atualizar o teste.",
          variant: "destructive",
        });
      },
    }
  );

  const deleteTestMutation = useMutation(
    async (testId: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return testId;
    },
    {
      onSuccess: (testId) => {
        setTests(tests.filter((test) => test.id !== testId));
        setDeleteTestId(null);
        queryClient.invalidateQueries({ queryKey: ["tests"] });
        toast({
          title: "Teste excluído",
          description: "Teste foi excluído com sucesso.",
        });
      },
      onError: () => {
        toast({
          title: "Erro ao excluir teste",
          description: "Houve um problema ao excluir o teste.",
          variant: "destructive",
        });
      },
    }
  );

  const handleCreateTest = () => {
    if (newTestName.trim() === "") {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome para o teste.",
        variant: "destructive",
      });
      return;
    }
    createTestMutation.mutate();
  };

  const handleUpdateTest = () => {
    if (editTestName.trim() === "") {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome para o teste.",
        variant: "destructive",
      });
      return;
    }
    if (editTestId) {
      updateTestMutation.mutate(editTestId);
    }
  };

  const handleDeleteTest = () => {
    if (deleteTestId) {
      deleteTestMutation.mutate(deleteTestId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard Administrativo
          </h1>
          <p className="text-lg text-gray-600">
            Gerencie testes e visualize resultados
          </p>
          <div className="mt-4">
            <a 
              href="/resume-enhancer" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Melhorador de Currículo
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Testes Criados</CardTitle>
              <CardDescription>Número total de testes criados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{tests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos</CardTitle>
              <CardDescription>Número de usuários ativos nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">42</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conclusão</CardTitle>
              <CardDescription>Taxa média de conclusão dos testes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">78%</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Teste
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Teste</DialogTitle>
                <DialogDescription>
                  Adicione um novo teste para os usuários responderem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo
                  </Label>
                  <select
                    id="type"
                    className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTestType}
                    onChange={(e) => setNewTestType(e.target.value)}
                  >
                    <option value="disc">DISC</option>
                    <option value="love-languages">Love Languages</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleCreateTest}>
                  Criar Teste
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tests Table */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="disc">DISC</TabsTrigger>
            <TabsTrigger value="love-languages">Love Languages</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="rounded-md border">
              <Table>
                <TableCaption>Lista de testes disponíveis.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  )}
                  {error && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Erro ao carregar os testes.
                      </TableCell>
                    </TableRow>
                  )}
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{test.type}</TableCell>
                      <TableCell>
                        {new Date(test.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(test.link)}
                        >
                          Visualizar
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditTestId(test.id);
                                setEditTestName(test.name);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Teste</DialogTitle>
                              <DialogDescription>
                                Edite o nome do teste.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                  Nome
                                </Label>
                                <Input
                                  id="name"
                                  value={editTestName}
                                  onChange={(e) => setEditTestName(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" onClick={handleUpdateTest}>
                                Salvar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTestId(test.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Excluir Teste</DialogTitle>
                              <DialogDescription>
                                Tem certeza de que deseja excluir este teste?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteTest}
                              >
                                Excluir
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="disc">
            <div>
              {tests
                .filter((test) => test.type === "disc")
                .map((test) => (
                  <div key={test.id}>{test.name}</div>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="love-languages">
            <div>
              {tests
                .filter((test) => test.type === "love-languages")
                .map((test) => (
                  <div key={test.id}>{test.name}</div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {/* Edit Test Modal */}
      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Teste</DialogTitle>
            <DialogDescription>Edite o nome do teste.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={editTestName}
                onChange={(e) => setEditTestName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateTest}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Test Modal */}
      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Teste</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este teste?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="destructive" onClick={handleDeleteTest}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
