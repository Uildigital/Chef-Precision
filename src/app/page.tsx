"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Settings,
  ChevronRight,
  Package,
  ChefHat,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

import { LandingAgent } from "@/components/agents/LandingAgent";
import { InventoryAgent } from "@/components/agents/InventoryAgent";
import { PricingWizardAgent } from "@/components/agents/RecipeAgent";
import { ProductionAgent } from "@/components/agents/ProductionAgent";
import { FinanceAgent } from "@/components/agents/FinanceAgent";
import { MathSkill } from "@/lib/logic/MathSkill";

export interface Insumo { id: string; name: string; price: number; quantity: number; unit: string; yield_percentage: number; }
export interface Receita { id: string; nome: string; itens: any[]; rendimento: number; margem_desejada: number; tempo_preparo: number; tempo_forno: number; preco_sugerido?: number; custo_total?: number; }

export default function ChefPrecisionV3() {
  const [view, setView] = useState<'dashboard' | 'wizard' | 'inventory' | 'production' | 'settings'>('dashboard');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [config, setConfig] = useState<any>({
    salario_desejado: 3000,
    horas_trabalhadas_mes: 160,
    taxa_fixa: 10,
    contas: { luz: 150, agua: 100, gas: 140, internet: 100 }
  });

  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        carregarDados(session.user.id);
      } else {
        const localIng = localStorage.getItem("chef-insumos");
        if (localIng) setInsumos(JSON.parse(localIng));
        const localRec = localStorage.getItem("chef-receitas");
        if (localRec) setReceitas(JSON.parse(localRec));
        const localConf = localStorage.getItem("chef-config");
        if (localConf) setConfig(JSON.parse(localConf));
      }
    };
    init();
  }, [supabase]);

  const carregarDados = async (userId: string) => {
    const { data: dIns } = await supabase.from('ingredients').select('*').eq('user_id', userId);
    if (dIns) setInsumos(dIns);

    const { data: dRec } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*)')
      .eq('user_id', userId);
    if (dRec && dRec.length > 0) {
      setReceitas(dRec.map(r => ({
        id: r.id,
        nome: r.name,
        rendimento: r.yield_quantity,
        tempo_preparo: r.prep_time_minutes,
        tempo_forno: r.oven_time_minutes,
        margem_desejada: r.markup_percentage,
        itens: (r.recipe_ingredients || []).map((ri: any) => ({
          id_insumo: ri.ingredient_id,
          quantidade_usada: ri.quantity_used,
          unit_used: ri.unit_used
        }))
      })));
    } else {
      const localRec = localStorage.getItem("chef-receitas");
      if (localRec) setReceitas(JSON.parse(localRec));
    }

    const { data: dConf } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
    if (dConf) setConfig((prev: any) => ({ ...prev, ...dConf }));
  };

  const salvarInsumo = async (novo: any) => {
    const item = { ...novo, id: Date.now().toString() };
    const lista = [...insumos, item];
    setInsumos(lista);
    localStorage.setItem("chef-insumos", JSON.stringify(lista));
    if (user) await supabase.from('ingredients').insert([{ ...novo, user_id: user.id }]);
  };

  const excluirInsumo = async (id: string) => {
    const lista = insumos.filter(i => i.id !== id);
    setInsumos(lista);
    localStorage.setItem("chef-insumos", JSON.stringify(lista));
    if (user) await supabase.from('ingredients').delete().eq('id', id);
  };

  const salvarReceita = async (nova: any) => {
    const item = { ...nova, id: Date.now().toString() };
    const lista = [...receitas, item];
    setReceitas(lista);
    localStorage.setItem("chef-receitas", JSON.stringify(lista));
    if (user) {
      try {
        const { data: recData } = await supabase
          .from('recipes')
          .insert([{
            name: nova.nome,
            yield_quantity: nova.rendimento,
            prep_time_minutes: nova.tempo_preparo,
            oven_time_minutes: nova.tempo_forno,
            markup_percentage: nova.margem_desejada,
            user_id: user.id
          }])
          .select('id')
          .single();
        if (recData?.id && nova.itens?.length) {
          await supabase.from('recipe_ingredients').insert(
            nova.itens.map((it: any) => ({
              recipe_id: recData.id,
              ingredient_id: it.id_insumo,
              quantity_used: it.quantidade_usada,
              unit_used: it.unit_used || 'g'
            }))
          );
        }
      } catch (e) {}
    }
  };

  const lucroTotal = receitas.reduce((s, r) => s + ((r.preco_sugerido ?? 0) - (r.custo_total ?? 0)), 0);

  return (
    <div className="min-h-screen bg-[#0D0B08] text-white font-sans antialiased">

      {/* Ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/8 blur-[130px]" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-[#D4AF37]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">

        {/* ── HEADER ── */}
        {view === 'dashboard' && (
          <header className="flex items-center justify-between px-5 pt-14 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8852A] flex items-center justify-center shadow-md shadow-[#D4AF37]/20">
                <ChefHat size={16} className="text-black" />
              </div>
              <div>
                <p className="text-[15px] font-black text-white leading-none tracking-tight">Receita de Lucro</p>
                <p className="text-[10px] text-white/25 mt-0.5 font-medium">calculadora para confeiteiros</p>
              </div>
            </div>
            <button className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center">
              <UserIcon size={13} className="text-white/25" />
            </button>
          </header>
        )}

        {/* ── MAIN ── */}
        <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ── */}
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >

                {/* Hero card */}
                <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/15 bg-gradient-to-br from-[#1E1600] via-[#141000] to-[#0D0B08] p-7 mb-1">
                  <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#D4AF37]/18 blur-[70px] pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]/60 block mb-1">Lucro Potencial</span>
                        <p className={`text-[52px] leading-none font-black tracking-tight ${receitas.length > 0 ? 'text-white' : 'text-white/12'}`}>
                          {receitas.length > 0
                            ? MathSkill.formatarMoeda(lucroTotal)
                            : 'R$ 0,00'}
                        </p>
                        <p className="text-[11px] text-white/30 font-medium mt-2">
                          {receitas.length > 0
                            ? `${receitas.length} receita${receitas.length !== 1 ? 's' : ''} · por lote de produção`
                            : 'Calcule uma receita para começar'}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progresso simbólica */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F0C84A] rounded-full transition-all duration-700"
                        style={{ width: receitas.length > 0 ? `${Math.min(receitas.length * 12, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA principal */}
                <button
                  onClick={() => setView('wizard')}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C49920] rounded-2xl p-[18px] flex items-center justify-between active:scale-[0.98] transition-transform shadow-lg shadow-[#D4AF37]/15"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 bg-black/20 rounded-xl flex items-center justify-center">
                      <PlusCircle size={22} className="text-black/70" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-black text-black leading-none">Calcular Nova Receita</p>
                      <p className="text-[10px] text-black/40 font-medium mt-1">Descubra o preço justo de venda</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-black/35" />
                </button>

                {/* Atalhos */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setView('inventory')}
                    className="bg-white/4 border border-white/8 rounded-2xl p-4 text-left active:scale-[0.97] transition-all"
                  >
                    <Package size={17} className="text-[#D4AF37]/55 mb-3" />
                    <p className="text-[13px] font-bold text-white leading-none">Estoque</p>
                    <p className="text-[10px] text-white/25 mt-1.5 font-medium leading-snug">
                      {insumos.length > 0
                        ? `${insumos.length} ingrediente${insumos.length !== 1 ? 's' : ''}`
                        : 'Adicionar ingredientes'}
                    </p>
                  </button>
                  <button
                    onClick={() => setView('production')}
                    className="bg-white/4 border border-white/8 rounded-2xl p-4 text-left active:scale-[0.97] transition-all"
                  >
                    <ShoppingBag size={17} className="text-[#D4AF37]/55 mb-3" />
                    <p className="text-[13px] font-bold text-white leading-none">Produção</p>
                    <p className="text-[10px] text-white/25 mt-1.5 font-medium leading-snug">Lista de compras</p>
                  </button>
                </div>

                {/* Onboarding ou lista de receitas */}
                {receitas.length === 0 ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/18 px-1 pb-1">Como funciona</p>
                    {[
                      {
                        num: '1',
                        title: 'Cadastre seus ingredientes',
                        desc: 'Farinha, ovos, chocolate — com preço e quantidade',
                        done: insumos.length > 0,
                        action: () => setView('inventory'),
                      },
                      {
                        num: '2',
                        title: 'Calcule o preço de uma receita',
                        desc: 'Somamos ingredientes, mão de obra e custos fixos',
                        done: false,
                        action: () => setView('wizard'),
                      },
                      {
                        num: '3',
                        title: 'Venda com confiança',
                        desc: 'Saiba exatamente quanto cobrar em cada venda',
                        done: false,
                        action: null,
                      },
                    ].map(step => (
                      <button
                        key={step.num}
                        onClick={step.action ?? undefined}
                        disabled={!step.action}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all
                          ${step.action ? 'active:scale-[0.98]' : 'cursor-default'}
                          ${step.done ? 'bg-[#D4AF37]/6 border-[#D4AF37]/18' : 'bg-white/3 border-white/7'}`}
                      >
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0
                          ${step.done ? 'bg-[#D4AF37] text-black' : 'bg-white/6 text-white/18'}`}>
                          {step.done ? '✓' : step.num}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-[13px] leading-none ${step.done ? 'line-through opacity-30' : 'text-white'}`}>
                            {step.title}
                          </p>
                          <p className="text-[11px] text-white/28 mt-1.5 font-medium leading-snug">{step.desc}</p>
                        </div>
                        {step.action && <ChevronRight size={14} className="text-white/15 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/18 px-1 pb-1">Minhas Receitas</p>
                    {receitas.map(r => (
                      <div key={r.id} className="bg-white/3 border border-white/7 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/22 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] font-black text-sm flex-shrink-0">
                            {r.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-white truncate">{r.nome}</p>
                            <p className="text-[10px] text-white/28 mt-0.5 font-medium">
                              custo {r.custo_total ? MathSkill.formatarMoeda(r.custo_total / r.rendimento) : '—'}/un
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 pl-3">
                          <p className="text-[13px] font-black text-[#D4AF37]">
                            {r.preco_sugerido ? MathSkill.formatarMoeda(r.preco_sugerido / r.rendimento) : '—'}
                          </p>
                          <p className="text-[10px] text-white/20 mt-0.5">venda/un</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            )}

            {view === 'wizard'     && <PricingWizardAgent insumos={insumos} config={config} onSalvar={salvarReceita} onVoltar={() => setView('dashboard')} />}
            {view === 'inventory'  && <InventoryAgent insumos={insumos} onAdicionar={salvarInsumo} onExcluir={excluirInsumo} onVoltar={() => setView('dashboard')} />}
            {view === 'production' && <ProductionAgent receitas={receitas} insumos={insumos} onVoltar={() => setView('dashboard')} />}
            {view === 'settings'   && <FinanceAgent config={config} setConfig={setConfig} user={user} supabase={supabase} onVoltar={() => setView('dashboard')} />}

          </AnimatePresence>
        </main>

        {/* ── NAV ── */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0D0B08]/96 backdrop-blur-xl border-t border-white/7 px-2 pt-3 pb-7 flex justify-around items-start z-50">
          {[
            { id: 'dashboard',  icon: LayoutDashboard, label: 'Início'   },
            { id: 'inventory',  icon: Package,          label: 'Estoque'  },
            { id: 'production', icon: ShoppingBag,      label: 'Produção' },
            { id: 'settings',   icon: Settings,         label: 'Finanças' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-colors ${view === item.id ? 'text-[#D4AF37]' : 'text-white/22'}`}
            >
              <item.icon size={21} strokeWidth={view === item.id ? 2.2 : 1.8} />
              <span className="text-[9px] font-bold tracking-wide leading-none">{item.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
