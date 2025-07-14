import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UserInfoModalProps {
  isOpen: boolean;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name, email, phone });
    } catch (err) {
      toast({
        title: "Erro ao salvar dados",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Antes de começar, preencha seus dados</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Começar Teste"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserInfoModal;
