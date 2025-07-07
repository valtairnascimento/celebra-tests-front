import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  _id: string;
  name: string;
  date: string;
  profile: string;
  profileColor?: string;
  status: "completed" | "pending";
}

interface TestTableProps {
  testType: "disc" | "love";
}

const TestTable: React.FC<TestTableProps> = ({ testType }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [results, setResults] = useState<TestResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = "http://localhost:5000/api";

  const profileColors = {
    disc: {
      Dominante: "bg-red-600",
      Influente: "bg-yellow-600",
      Estável: "bg-green-600",
      Consciente: "bg-blue-600",
      "Dominante/Influente": "bg-red-500",
      "Dominante/Estável": "bg-red-400",
      "Dominante/Consciente": "bg-red-700",
      "Influente/Dominante": "bg-yellow-500",
      "Influente/Estável": "bg-yellow-400",
      "Influente/Consciente": "bg-yellow-700",
      "Estável/Dominante": "bg-green-500",
      "Estável/Influente": "bg-green-400",
      "Estável/Consciente": "bg-green-700",
      "Consciente/Dominante": "bg-blue-500",
      "Consciente/Influente": "bg-blue-400",
      "Consciente/Estável": "bg-blue-700",
    },
    love: {
      "Palavras de Afirmação": "bg-purple-600",
      "Atos de Serviço": "bg-blue-600",
      Presentes: "bg-pink-600",
      "Tempo de Qualidade": "bg-green-600",
      "Toque Físico": "bg-red-600",
      "Atos de Serviço/Presentes": "bg-blue-500",
      "Atos de Serviço/Tempo de Qualidade": "bg-blue-400",
      "Atos de Serviço/Toque Físico": "bg-blue-700",
      "Atos de Serviço/Palavras de Afirmação": "bg-blue-300",
      "Presentes/Atos de Serviço": "bg-pink-500",
      "Presentes/Tempo de Qualidade": "bg-pink-400",
      "Presentes/Toque Físico": "bg-pink-700",
      "Presentes/Palavras de Afirmação": "bg-pink-300",
      "Tempo de Qualidade/Atos de Serviço": "bg-green-500",
      "Tempo de Qualidade/Presentes": "bg-green-400",
      "Tempo de Qualidade/Toque Físico": "bg-green-700",
      "Tempo de Qualidade/Palavras de Afirmação": "bg-green-300",
      "Toque Físico/Atos de Serviço": "bg-red-500",
      "Toque Físico/Presentes": "bg-red-400",
      "Toque Físico/Tempo de Qualidade": "bg-red-700",
      "Toque Físico/Palavras de Afirmação": "bg-red-300",
    },
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint =
          testType === "disc" ? "disc/results" : "love-languages/results";
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          ...(searchTerm && { name: searchTerm }),
          ...(profileFilter !== "all" && { profile: profileFilter }),
        });
        const response = await fetch(`${API_BASE_URL}/${endpoint}?${params}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao buscar resultados");
        }
        const data = await response.json();
        console.log("Resultados recebidos:", data.results);
        setResults(data.results);
        setTotalPages(data.pages);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Erro ao carregar resultados",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [testType, currentPage, searchTerm, profileFilter]);

  const handleDownload = async (id: string, name: string) => {
    try {
      const endpoint =
        testType === "disc"
          ? `disc/report/${id}`
          : `love-languages/report/${id}`;
      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!response.ok) throw new Error("Erro ao baixar PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}_${testType}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "PDF baixado",
        description: `Relatório de ${name} baixado com sucesso.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao baixar PDF",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getProfileOptions = () => {
    if (testType === "disc") {
      return [
        "Dominante",
        "Influente",
        "Estável",
        "Consciente",
        "Dominante/Influente",
        "Dominante/Estável",
        "Dominante/Consciente",
        "Influente/Dominante",
        "Influente/Estável",
        "Influente/Consciente",
        "Estável/Dominante",
        "Estável/Influente",
        "Estável/Consciente",
        "Consciente/Dominante",
        "Consciente/Influente",
        "Consciente/Estável",
      ];
    }
    return [
      "Palavras de Afirmação",
      "Atos de Serviço",
      "Presentes",
      "Tempo de Qualidade",
      "Toque Físico",
      "Atos de Serviço/Presentes",
      "Atos de Serviço/Tempo de Qualidade",
      "Atos de Serviço/Toque Físico",
      "Atos de Serviço/Palavras de Afirmação",
      "Presentes/Atos de Serviço",
      "Presentes/Tempo de Qualidade",
      "Presentes/Toque Físico",
      "Presentes/Palavras de Afirmação",
      "Tempo de Qualidade/Atos de Serviço",
      "Tempo de Qualidade/Presentes",
      "Tempo de Qualidade/Toque Físico",
      "Tempo de Qualidade/Palavras de Afirmação",
      "Toque Físico/Atos de Serviço",
      "Toque Físico/Presentes",
      "Toque Físico/Tempo de Qualidade",
      "Toque Físico/Palavras de Afirmação",
    ];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={profileFilter} onValueChange={setProfileFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              {getProfileOptions().map((profile) => (
                <SelectItem key={profile} value={profile}>
                  {profile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">Erro: {error}</div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Usuário</TableHead>
              <TableHead>Data de Conclusão</TableHead>
              <TableHead>Perfil Principal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum resultado encontrado
                </TableCell>
              </TableRow>
            ) : (
              results.map((test) => (
                <TableRow key={test._id}>
                  <TableCell className="font-medium">
                    {test.name || "Anônimo"}
                  </TableCell>
                  <TableCell>
                    {test.date
                      ? new Date(test.date).toLocaleDateString("pt-BR")
                      : "Data indisponível"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        test.profileColor || "bg-gray-600"
                      } text-white`}
                    >
                      {test.profile || "Perfil desconhecido"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        test.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {test.status === "completed" ? "Concluído" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleDownload(test._id, test.name || "relatorio")
                      }
                      className="bg-gray-600 hover:bg-gray-700"
                      disabled={loading}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                  className="cursor-pointer"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TestTable;
