import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  testType: "disc" | "love";
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({
  isOpen,
  onClose,
  testType,
}) => {
  const [testName, setTestName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = "http://localhost:5000/api";

  const handleGenerateTest = async () => {
    if (!testName.trim()) {
      toast({
        title: "Nome do usuário obrigatório",
        description: "Por favor, informe o nome do usuário que fará o teste.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const endpoint =
        testType === "disc" ? "disc/create-link" : "love-languages/create-link";
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar link do teste");
      }
      const { link } = await response.json();
      setGeneratedLink(link);
      toast({
        title: "Teste gerado com sucesso!",
        description: "Link temporário criado. Compartilhe com o participante.",
      });
    } catch (err) {
      console.error("Erro ao gerar link:", err);
      toast({
        title: "Erro ao gerar teste",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTestName("");
    setGeneratedLink("");
    setCopied(false);
    onClose();
  };

  const testTypeLabels = {
    disc: "Teste DISC",
    love: "Linguagens de Amor",
  };

  const testTypeColors = {
    disc: "from-blue-600 to-blue-700",
    love: "from-purple-600 to-purple-700",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${testTypeColors[testType]}`}
            />
            Gerar {testTypeLabels[testType]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testName">Nome do Usuário *</Label>
            <Input
              id="testName"
              placeholder="Ex: João Silva"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>

          {generatedLink && (
            <div className="space-y-2">
              <Label>Link Gerado</Label>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="bg-gray-50" />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Este link é válido por 1 hora e pode ser usado apenas uma vez.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleGenerateTest}
              disabled={isGenerating}
              className={`flex-1 bg-gradient-to-r ${testTypeColors[testType]} hover:opacity-90`}
            >
              {isGenerating ? "Gerando..." : "Gerar Teste"}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTestModal;
