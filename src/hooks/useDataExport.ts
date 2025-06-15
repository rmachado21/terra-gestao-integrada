
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const useDataExport = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportData = async () => {
    setLoading(true);
    const { id, update } = toast({
      title: "Iniciando Backup",
      description: "Seu backup está sendo preparado. O download começará em breve...",
    });

    try {
      const { data: responseData, error } = await supabase.functions.invoke('export-user-data');

      if (error) throw error;
      if (!responseData || !responseData.data) {
        throw new Error("A resposta da função de backup está incompleta.");
      }
      
      const arrayBuffer = base64ToArrayBuffer(responseData.data);
      const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_dados_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      update({
        id,
        title: "Backup Concluído",
        description: "Seu arquivo de backup foi baixado com sucesso.",
        variant: 'default',
      });

    } catch (error: any) {
      console.error('Error exporting data:', error);
      update({
        id,
        title: "Erro no Backup",
        description: error.message || "Não foi possível gerar o backup. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { exportData, loading };
};
