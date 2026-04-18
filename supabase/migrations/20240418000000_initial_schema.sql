-- Migration: Initial B2B Gastronomic SaaS Schema
-- Includes Tenants, Ingredients (with yield), Recipes, and Fixed Costs with RLS

-- 0. Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: user_settings (Tenant Metadata)
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    monthly_salary_target DECIMAL(10,2) DEFAULT 2500.00,
    working_hours_per_month INTEGER DEFAULT 160,
    profit_margin_default DECIMAL(5,2) DEFAULT 100.00,
    currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: fixed_costs
CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    monthly_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: ingredients (Advanced Model)
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    purchase_quantity DECIMAL(10,3) NOT NULL,
    purchase_unit TEXT NOT NULL, -- 'kg', 'g', 'L', 'ml', 'un'
    yield_percentage DECIMAL(5,2) DEFAULT 100.00, -- 'Fator de Rendimento (aproveitamento)'
    inventory_alert_threshold DECIMAL(10,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: recipes
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    yield_quantity DECIMAL(10,2) NOT NULL, -- How much it produces (e.g., 20 units)
    prep_time_minutes INTEGER DEFAULT 0,
    oven_time_minutes INTEGER DEFAULT 0,
    markup_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: recipe_ingredients (N:N with custom quantity/unit)
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE SET NULL,
    quantity_used DECIMAL(10,3) NOT NULL,
    unit_used TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --- Row Level Security (RLS) Policies ---

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Shared Policy Template (Tenant Isolation)
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN 
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_settings', 'fixed_costs', 'ingredients', 'recipes', 'recipe_ingredients')
    LOOP
        EXECUTE format('CREATE POLICY "Users can only access their own data" ON public.%I FOR ALL USING (auth.uid() = user_id)', tbl);
    END LOOP;
END $$;

-- Correction for recipe_ingredients which doesn't have a direct user_id
-- It should be protected via its relationship to recipes
DROP POLICY "Users can only access their own data" ON public.recipe_ingredients;
CREATE POLICY "Users can only access through recipe ownership" ON public.recipe_ingredients
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.recipes 
        WHERE id = public.recipe_ingredients.recipe_id 
        AND user_id = auth.uid()
    )
);
