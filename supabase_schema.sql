-- ==========================================
-- 1. APAGAR DADOS DA LÓGICA ANTIGA
-- ==========================================
-- Use este bloco para limpar o banco. Cuidado: isso apaga os dados reais.

DROP TABLE IF EXISTS public.ingredients CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.receitas CASCADE;
DROP TABLE IF EXISTS public.insumos CASCADE;

-- ==========================================
-- 2. CRIAR A NOVA LÓGICA (TABELAS ENXUTAS)
-- ==========================================

-- Tabela de Insumos (Estoque Base)
CREATE TABLE public.insumos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco_embalagem NUMERIC NOT NULL,
  tamanho_embalagem NUMERIC NOT NULL, -- em gramas ou ml
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Receitas (Fichas Técnicas e Precificação)
CREATE TABLE public.receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb, -- Armazena o array de itens usados
  minutos_preparo_ativo INTEGER DEFAULT 0,
  minutos_forno INTEGER DEFAULT 0,
  margem_lucro_desejada NUMERIC DEFAULT 30,
  preco_sugerido NUMERIC,
  lucro_liquido NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Desativar RLS (Row Level Security) temporariamente para facilitar o desenvolvimento/testes
-- Em produção com múltiplos usuários, você deve ativar e criar as políticas.
ALTER TABLE public.insumos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas DISABLE ROW LEVEL SECURITY;
