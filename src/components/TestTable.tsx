import React, { useState, useEffect } from "react";
import { Download, Filter, Search } from "lucide-react";

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

  const API_BASE_URL = "http://localhost:5000/api";

  const getDiscColor = (profile: string): string => {
    if (!profile || typeof profile !== 'string') return 'bg-gray-600';
    
    const profileLower = profile.toLowerCase();
    
    if (profileLower.includes('dominante')) return 'bg-red-600';
    if (profileLower.includes('influente')) return 'bg-yellow-600';
    if (profileLower.includes('estável')) return 'bg-green-600';
    if (profileLower.includes('consciente')) return 'bg-blue-600';
    
    return 'bg-gray-600'; 
  };

  const getLoveLanguageColor = (profile: string): string => {
    if (!profile || typeof profile !== 'string') return 'bg-gray-600';
    
    const profileLower = profile.toLowerCase();
    
    if (profileLower.includes('palavras de afirmação')) return 'bg-purple-600';
    if (profileLower.includes('atos de serviço')) return 'bg-blue-600';
    if (profileLower.includes('presentes')) return 'bg-green-600';
    if (profileLower.includes('tempo de qualidade')) return 'bg-orange-600';
    if (profileLower.includes('toque físico')) return 'bg-pink-600';
    
    return 'bg-gray-600'; 
  };

  const getBadgeColor = (profile: string): string => {
    if (!profile || typeof profile !== 'string') return 'bg-gray-600';
    
    if (testType === "disc") {
      return getDiscColor(profile);
    } else {
      return getLoveLanguageColor(profile);
    }
  };

  const showToast = (title: string, description: string, variant: string = "default") => {
  };

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
        
       
        
        setResults(data.results || []);
        setTotalPages(data.pages || 1);
      } catch (err: any) {
        setError(err.message);
        showToast("Erro ao carregar resultados", err.message, "destructive");
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
      
      showToast("PDF baixado", `Relatório de ${name} baixado.`);
    } catch (err: any) {
      showToast("Erro ao baixar PDF", err.message, "destructive");
    }
  };

  const getProfileOptions = () => testType === "disc"
    ? ["Dominante", "Influente", "Estável", "Consciente", "Dominante/Influente", "Dominante/Estável", "Dominante/Consciente", "Influente/Dominante", "Influente/Estável", "Influente/Consciente", "Estável/Dominante", "Estável/Influente", "Estável/Consciente", "Consciente/Dominante", "Consciente/Influente", "Consciente/Estável"]
    : ["Palavras de Afirmação", "Atos de Serviço", "Presentes", "Tempo de Qualidade", "Toque Físico", "Atos de Serviço/Presentes", "Atos de Serviço/Tempo de Qualidade", "Atos de Serviço/Toque Físico", "Atos de Serviço/Palavras de Afirmação", "Presentes/Atos de Serviço", "Presentes/Tempo de Qualidade", "Presentes/Toque Físico", "Presentes/Palavras de Afirmação", "Tempo de Qualidade/Atos de Serviço", "Tempo de Qualidade/Presentes", "Tempo de Qualidade/Toque Físico", "Tempo de Qualidade/Palavras de Afirmação", "Toque Físico/Atos de Serviço", "Toque Físico/Presentes", "Toque Físico/Tempo de Qualidade", "Toque Físico/Palavras de Afirmação"];

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text"
              placeholder="Buscar por nome..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={profileFilter} 
              onChange={e => setProfileFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os perfis</option>
              {getProfileOptions().map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="rounded-md border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span>Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum resultado encontrado
                </td>
              </tr>
            ) : (
              results.map(test => (
                <tr key={test._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {test.name || "Anônimo"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {test.email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {test.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {test.date ? new Date(test.date).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getBadgeColor(test.profile || '')}`}
                    >
                      {test.profile || 'Sem perfil'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${
                        test.status === "completed" ? "bg-green-600" : "bg-yellow-600"
                      }`}
                    >
                      {test.status === "completed" ? "Concluído" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDownload(test._id, test.name || "relatorio")} 
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 text-sm border rounded-md ${
                currentPage === i + 1 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default TestTable;