
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, Search } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface TestResult {
  id: string;
  userName: string;
  completedAt: string;
  mainProfile: string;
  profileColor: string;
  status: 'completed' | 'pending';
}

interface TestTableProps {
  testType: 'disc' | 'love';
}

const TestTable: React.FC<TestTableProps> = ({ testType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - será substituído pela integração real com a API
  const mockData: TestResult[] = [
    {
      id: '1',
      userName: 'João Silva',
      completedAt: '2024-01-15',
      mainProfile: testType === 'disc' ? 'Dominante' : 'Palavras de Afirmação',
      profileColor: testType === 'disc' ? 'bg-red-500' : 'bg-purple-500',
      status: 'completed',
    },
    {
      id: '2',
      userName: 'Maria Santos',
      completedAt: '2024-01-14',
      mainProfile: testType === 'disc' ? 'Influente' : 'Atos de Serviço',
      profileColor: testType === 'disc' ? 'bg-yellow-500' : 'bg-blue-500',
      status: 'completed',
    },
    {
      id: '3',
      userName: 'Pedro Costa',
      completedAt: '2024-01-13',
      mainProfile: testType === 'disc' ? 'Estável' : 'Tempo de Qualidade',
      profileColor: testType === 'disc' ? 'bg-green-500' : 'bg-green-500',
      status: 'completed',
    },
  ];

  const filteredData = mockData.filter(item => 
    item.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (profileFilter === 'all' || item.mainProfile === profileFilter)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleDownload = (id: string, userName: string) => {
    console.log(`Downloading PDF for ${userName} (ID: ${id})`);
    // Aqui será implementada a chamada para a API de download do PDF
  };

  const getProfileOptions = () => {
    if (testType === 'disc') {
      return ['Dominante', 'Influente', 'Estável', 'Consciente'];
    }
    return ['Palavras de Afirmação', 'Atos de Serviço', 'Presentes', 'Tempo de Qualidade', 'Toque Físico'];
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
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

      {/* Table */}
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
            {paginatedData.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.userName}</TableCell>
                <TableCell>{new Date(test.completedAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge className={`${test.profileColor} text-white`}>
                    {test.mainProfile}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                    {test.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleDownload(test.id, test.userName)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TestTable;
