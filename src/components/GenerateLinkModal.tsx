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

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  testType: "disc" | "love";
}

const GenerateLinkModal: React.FC<GenerateLinkModalProps> = ({
  isOpen,
  onClose,
  testType,
}) => {
  const [generatedLink, setGeneratedLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = "http://localhost:5000/api";

  const handleGenerateTest = async () => {
    setIsGenerating(true);
    try {
      const endpoint =
        testType === "disc" ? "disc/create-link" : "love-languages/create-link";

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar link do teste");
      }

      const { link } = await response.json();
      setGeneratedLink(link);

      toast({
        title: "Link gerado com sucesso!",
        description: "Compartilhe com o usuário.",
      });
    } catch (err) {
      toast({
        title: "Erro ao gerar link",
        description: (err as Error).message,
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
      toast({ title: "Link copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar link",
        description: "Verifique as permissões do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setGeneratedLink("");
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Link de Teste</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!generatedLink ? (
            <Button
              onClick={handleGenerateTest}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {isGenerating ? "Gerando..." : "Gerar Link"}
            </Button>
          ) : (
            <>
              <Label>Link Gerado</Label>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="bg-gray-50" />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O link expira em 1 hora e pode ser usado apenas uma vez.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateLinkModal;
