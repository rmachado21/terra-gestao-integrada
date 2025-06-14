
-- Adicionar novos campos à tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN cpf_cnpj VARCHAR,
ADD COLUMN cep VARCHAR,
ADD COLUMN bairro VARCHAR,
ADD COLUMN estado VARCHAR;
