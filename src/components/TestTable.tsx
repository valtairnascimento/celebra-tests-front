import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search } from "lucide-react";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
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

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = testType === "disc" ? "disc/results" : "love-languages/results";
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          ...(searchTerm && { name: searchTerm }),
          ...(profileFilter !== "all" && { profile: profileFilter }),
        });
        const res = await fetch(`${API_BASE_URL}/${endpoint}?${params}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erro ao buscar resultados");
        }
        const data = await res.json();
        setResults(data.results);
        setTotalPages(data.pages);
      } catch (err: any) {
        setError(err.message);
        toast({ title: "Erro ao carregar resultados", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [testType, currentPage, searchTerm, profileFilter]);


  const handleDownload = async (id: string, name: string) => {
    try {
      const endpoint = testType === "disc" ? `disc/report/${id}` : `love-languages/report/${id}`;
      const res = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!res.ok) throw new Error("Erro ao baixar PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}_${testType}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "PDF baixado", description: `Relatório de ${name} baixado.` });
    } catch (err: any) {
      toast({ title: "Erro ao baixar PDF", description: err.message, variant: "destructive" });
    }
  };

  const getProfileOptions = () => testType === "disc"
    ? ["Dominante", "Influente", "Estável", "Consciente", "Dominante/Influente", "Dominante/Estável", "Dominante/Consciente", "Influente/Dominante", "Influente/Estável", "Influente/Consciente", "Estável/Dominante", "Estável/Influente", "Estável/Consciente", "Consciente/Dominante", "Consciente/Influente", "Consciente/Estável"]
    : ["Palavras de Afirmação", "Atos de Serviço", "Presentes", "Tempo de Qualidade", "Toque Físico", "Atos de Serviço/Presentes", "Atos de Serviço/Tempo de Qualidade", "Atos de Serviço/Toque Físico", "Atos de Serviço/Palavras de Afirmação", "Presentes/Atos de Serviço", "Presentes/Tempo de Qualidade", "Presentes/Toque Físico", "Presentes/Palavras de Afirmação", "Tempo de Qualidade/Atos de Serviço", "Tempo de Qualidade/Presentes", "Tempo de Qualidade/Toque Físico", "Tempo de Qualidade/Palavras de Afirmação", "Toque Físico/Atos de Serviço", "Toque Físico/Presentes", "Toque Físico/Tempo de Qualidade", "Toque Físico/Palavras de Afirmação"];



    console.log(results)
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Buscar por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={profileFilter} onValueChange={setProfileFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              {getProfileOptions().map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded">Erro: {error}</div>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center">Carregando...</TableCell></TableRow>
            ) : results.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center">Nenhum resultado encontrado</TableCell></TableRow>
            ) : results.map(test => (
              <TableRow key={test._id}>
                <TableCell>{test.name || "Anônimo"}</TableCell>
                <TableCell>{test.email || "-"}</TableCell>
                <TableCell>{test.phone || "-"}</TableCell>
                <TableCell>{test.date ? new Date(test.date).toLocaleDateString("pt-BR") : "-"}</TableCell>
                <TableCell><Badge className={`${test.profileColor || "bg-gray-600"} text-white`}>{test.profile}</Badge></TableCell>
                <TableCell><Badge variant={test.status === "completed" ? "default" : "secondary"}>{test.status === "completed" ? "Concluído" : "Pendente"}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleDownload(test._id, test.name || "relatorio")} className="bg-gray-600 hover:bg-gray-700" disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1} className="cursor-pointer">{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TestTable;
