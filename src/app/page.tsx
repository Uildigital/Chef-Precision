"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Settings,
  ChevronRight,
  TrendingUp,
  Package,
  ChefHat,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// Agents (v3 - Reset Total)
import { LandingAgent } from "@/components/agents/LandingAgent"; // Manteve para o Splash
import { InventoryAgent } from "@/components/agents/InventoryAgent";
import { PricingWizardAgent } from "@/components/agents/RecipeAgent";
import { ProductionAgent } from "@/components/agents/ProductionAgent";
import { FinanceAgent } from "@/components/agents/FinanceAgent";
import { MathSkill } from "@/lib/logic/MathSkill";

// Interfaces
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

  // --- CARREGAMENTO DE DADOS ---
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D4AF37] selection:text-black font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
        {view === 'dashboard' && (
            <header className="px-8 pt-10 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                        <ChefHat size={20} className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight leading-none">Receita de Lucro</h1>
                        <p className="text-[10px] text-white/30 font-medium mt-0.5">Precifique. Lucre. Cresça.</p>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserIcon size={16} className="text-white/20" />
                </div>
            </header>
        )}

        <main className="flex-1 px-6 pt-4 pb-32">
            <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                        {/* Card de lucro */}
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-3">Lucro Potencial</span>
                                {receitas.length > 0 ? (
                                    <>
                                        <h2 className="text-5xl font-black tracking-tighter italic mb-2">
                                            {MathSkill.formatarMoeda(receitas.reduce((s, r) => s + ((r.preco_sugerido ?? 0) - (r.custo_total ?? 0)), 0))}
                                        </h2>
                                        <p className="text-white/30 text-[10px] font-medium">
                                            {receitas.length} receita{receitas.length !== 1 ? 's' : ''} precificada{receitas.length !== 1 ? 's' : ''}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-5xl font-black tracking-tighter italic mb-2 text-white/15">R$ —</h2>
                                        <p className="text-white/30 text-[10px] font-medium">Calcule sua primeira receita para ver seu lucro</p>
                                    </>
                                )}
                            </div>
                            <TrendingUp className="absolute right-[-10%] bottom-[-10%] text-white/5 w-40 h-40 -rotate-12" />
                        </div>

                        {/* Ação principal */}
                        <button onClick={() => setView('wizard')} className="w-full bg-[#D4AF37] p-6 rounded-[2.5rem] flex items-center justify-between active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10">
                            <div className="flex items-center gap-5 text-black">
                                <div className="h-14 w-14 bg-black rounded-2xl flex items-center justify-center text-[#D4AF37]">
                                    <PlusCircle size={28} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black uppercase tracking-[0.1em]">Calcular Nova Receita</p>
                                    <p className="text-[10px] opacity-60 font-medium">Descubra o preço justo de venda</p>
                                </div>
                            </div>
                            <ChevronRight className="text-black" />
                        </button>

                        {/* Onboarding (sem receitas) ou lista de receitas */}
                        {receitas.length === 0 ? (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-1 pb-1">Como funciona</p>
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
                                        className={`w-full p-5 rounded-[2rem] border flex items-center gap-4 text-left transition-all ${step.action ? 'active:scale-[0.98]' : 'cursor-default'} ${step.done ? 'bg-[#D4AF37]/5 border-[#D4AF37]/25' : 'bg-white/3 border-white/8'}`}
                                    >
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${step.done ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/20'}`}>
                                            {step.done ? '✓' : step.num}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-black text-sm tracking-tight ${step.done ? 'line-through opacity-40' : ''}`}>{step.title}</p>
                                            <p className="text-[10px] text-white/30 mt-0.5 font-medium">{step.desc}</p>
                                        </div>
                                        {step.action && <ChevronRight size={16} className="text-white/20 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Minhas Receitas</h3>
                                    <button onClick={() => setView('inventory')} className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Ver Estoque</button>
                                </div>
                                <div className="grid gap-3">
                                    {receitas.map(r => (
                                        <div key={r.id} className="bg-white/5 p-5 rounded-[2rem] border border-transparent hover:border-white/10 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37] font-black text-base">
                                                        {r.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{r.nome}</p>
                                                        <p className="text-[10px] text-white/30 mt-0.5">
                                                            {r.rendimento} un · custo {r.custo_total ? MathSkill.formatarMoeda(r.custo_total / r.rendimento) : '—'}/un
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-[#D4AF37]">
                                                        {r.preco_sugerido ? MathSkill.formatarMoeda(r.preco_sugerido / r.rendimento) : '—'}
                                                    </p>
                                                    <p className="text-[9px] text-white/20 mt-0.5">venda/un</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {view === 'wizard' && <PricingWizardAgent insumos={insumos} config={config} onSalvar={salvarReceita} onVoltar={() => setView('dashboard')} />}
                {view === 'inventory' && <InventoryAgent insumos={insumos} onAdicionar={salvarInsumo} onExcluir={excluirInsumo} onVoltar={() => setView('dashboard')} />}
                {view === 'production' && <ProductionAgent receitas={receitas} insumos={insumos} onVoltar={() => setView('dashboard')} />}
                {view === 'settings' && <FinanceAgent config={config} setConfig={setConfig} user={user} supabase={supabase} onVoltar={() => setView('dashboard')} />}
            </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-t border-white/5 px-6 pt-4 pb-8 flex justify-around items-center z-[100] rounded-t-[2.5rem]">
            {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
                { id: 'inventory', icon: Package,         label: 'Estoque' },
                { id: 'production', icon: ShoppingBag,   label: 'Produção' },
                { id: 'settings', icon: Settings,        label: 'Finanças' },
            ].map(item => (
                <button key={item.id} onClick={() => setView(item.id as any)} className={`flex flex-col items-center gap-1.5 px-3 transition-all ${view === item.id ? 'text-[#D4AF37]' : 'text-white/20 hover:text-white/40'}`}>
                    <item.icon size={22} />
                    <span className="text-[9px] font-black uppercase tracking-wider leading-none">{item.label}</span>
                    {view === item.id && <motion.div layoutId="navDot" className="h-0.5 w-4 bg-[#D4AF37] rounded-full" />}
                </button>
            ))}
        </nav>
      </div>
    </div>
  );
}
