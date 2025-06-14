
-- Primeira parte: Adicionar novo valor ao enum e campos na tabela
ALTER TYPE tipo_plano ADD VALUE IF NOT EXISTS 'teste';

-- Adicionar campos para integração com Stripe na tabela user_plans
ALTER TABLE public.user_plans 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Criar tabela subscribers para cache dos dados do Stripe
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscribers
CREATE POLICY "Users can view their own subscription" 
  ON public.subscribers 
  FOR SELECT 
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription" 
  ON public.subscribers 
  FOR UPDATE 
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can insert their own subscription" 
  ON public.subscribers 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR email = auth.email());
