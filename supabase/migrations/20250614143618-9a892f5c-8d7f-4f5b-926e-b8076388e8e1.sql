
-- Adicionar novos campos à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN empresa_nome VARCHAR,
ADD COLUMN cnpj VARCHAR,
ADD COLUMN logo_url TEXT;

-- Criar bucket para logos das empresas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true);

-- Criar política para permitir upload de logos
CREATE POLICY "Users can upload their company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Criar política para permitir visualização de logos
CREATE POLICY "Anyone can view company logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos');

-- Criar política para permitir atualização de logos
CREATE POLICY "Users can update their company logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Criar política para permitir exclusão de logos
CREATE POLICY "Users can delete their company logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
