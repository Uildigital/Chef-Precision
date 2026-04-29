---
name: criando-calculadora-lucro
description: Constrói uma aplicação de calculadora de lucros para confeitaria e negócios locais, garantindo a lógica de margem real, banco de dados local e UX mobile-first. Use quando o usuário pedir para gerar, atualizar ou refatorar a calculadora culinária.
---

# Construção da Calculadora Chef Precision

## Quando usar esta skill
- Quando for solicitado criar a base da Calculadora de Custos Culinários.
- Quando for preciso implementar a lógica matemática de precificação (Markup vs Margem Real).
- Quando for necessário estruturar o banco de dados (localStorage inicial, preparado para Supabase).

## Fluxo de Trabalho (Workflow)

Siga este checklist rigorosamente para evitar a "falácia da perfeição técnica" e focar em entregar valor prático:

- [ ] **Passo 1: Fundações (Tipagem)**
  - Definir as interfaces `Insumo` (com conversão de medidas) e `Receita`.
- [ ] **Passo 2: Motor de Cálculo Lógico (O Cérebro)**
  - Criar função utilitária para calcular o valor do "Minuto de Trabalho" baseado na meta salarial.
  - Criar função de rateio de custos fixos (água, luz, gás) por receita.
- [ ] **Passo 3: Interface "Wizard" (Mobile-First)**
  - Construir um fluxo passo-a-passo e não um formulário longo.
  - Pergunta 1: Ingredientes (Quantidade usada vs. Preço da embalagem).
  - Pergunta 2: Tempos (Preparo ativo vs. Forno).
  - Pergunta 3: Margem Desejada.
- [ ] **Passo 4: Tela de Resultado Visual**
  - Exibir: Custo Total, Preço Sugerido e Lucro Líquido Real.

## Instruções de Código

### A. Tipos Essenciais
Use esta estrutura base para garantir consistência:
```typescript
interface Insumo {
  id: string;
  nome: string;
  precoEmbalagem: number;
  tamanhoEmbalagem: number; // em gramas ou ml
}

interface Receita {
  id: string;
  nome: string;
  ingredientesUsados: { insumoId: string; quantidadeUsada: number }[];
  minutosPreparoAtivo: number;
  minutosForno: number;
  margemLucroDesejada: number; // Porcentagem (ex: 30)
}
```

### B. O Segredo da Precificação (Custo Oculto)
Nunca calcule apenas os ingredientes. Instrua o código a sempre somar o "Custo Fixo Rateado" + "Custo da Mão de Obra". 
*Fórmula: Custo Total = Custo Ingredientes + (Minutos Trabalhados * Valor do Minuto) + Taxa Variável do Forno.*

## Recursos Opcionais
- Se o usuário pedir integração com banco de dados, utilize `supabase/client.ts`.
- Mantenha o design escuro e com alto contraste para facilitar a leitura em cozinhas (onde a iluminação varia).
