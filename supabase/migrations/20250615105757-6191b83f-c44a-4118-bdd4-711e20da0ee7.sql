
-- Habilitar RLS nas tabelas de vendas se ainda não estiver habilitado
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view their own pedidos" 
  ON public.pedidos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own clientes" 
  ON public.clientes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_pedido ON public.pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON public.pedidos(status);
