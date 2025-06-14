
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onUpload: (file: File) => Promise<string | null>;
  uploading?: boolean;
}

const LogoUpload = ({ currentLogoUrl, onUpload, uploading }: LogoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    const logoUrl = await onUpload(file);
    
    if (logoUrl) {
      // Clean up the object URL and use the actual URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(logoUrl);
    } else {
      // Reset preview on error
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(currentLogoUrl || null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Logo da empresa"
              className="w-20 h-20 object-contain border border-gray-200 rounded-lg"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveLogo}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Selecionar Logo'}
          </Button>
          <p className="text-sm text-gray-500 mt-1">
            PNG, JPG ou GIF até 5MB
          </p>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default LogoUpload;
