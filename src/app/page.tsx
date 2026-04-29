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
  ArrowRight,
  Menu,
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
            <header className="p-8 pb-4 flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-1">Elite Management</p>
                    <h1 className="text-2xl font-black tracking-tighter italic">Meu Ateliê</h1>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserIcon size={16} className="text-white/20" />
                </div>
            </header>
        )}

        <main className="flex-1 px-6 pt-4 pb-32">
            <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                        {/* Dashboard Stats */}
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-4">Saldo do Ateliê</span>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h2 className="text-5xl font-black tracking-tighter italic">{MathSkill.formatarMoeda(receitas.reduce((s, r) => s + ((r.preco_sugerido ?? 0) - (r.custo_total ?? 0)), 0))}</h2>
                                </div>
                                <p className="text-white/40 text-[10px] font-medium leading-relaxed max-w-[200px]">Lucro potencial por produção das suas receitas.</p>
                            </div>
                            <TrendingUp className="absolute right-[-10%] bottom-[-10%] text-white/5 w-40 h-40 -rotate-12" />
                        </div>

                        {/* Intention Grid */}
                        <div className="grid gap-4">
                            <button onClick={() => setView('wizard')} className="w-full bg-[#D4AF37] p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10">
                                <div className="flex items-center gap-5 text-black">
                                    <div className="h-14 w-14 bg-black rounded-2xl flex items-center justify-center text-[#D4AF37]"><PlusCircle size={28}/></div>
                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-[0.1em]">Precificar Algo</p>
                                        <p className="text-[10px] opacity-60 font-black italic">Novo cálculo guiado</p>
                                    </div>
                                </div>
                                <ArrowRight className="text-black" />
                            </button>

                            <button onClick={() => setView('inventory')} className="w-full bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between group active:scale-95 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-[#D4AF37] transition-colors"><Package size={24}/></div>
                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-[0.1em]">Gerenciar Insumos</p>
                                        <p className="text-[10px] text-white/40 font-black italic">Atualizar preços e estoque</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-white/20" />
                            </button>
                        </div>

                        {/* Recent Recipes */}
                        <div className="space-y-6">
                             <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Suas Fichas</h3>
                                <button className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Ver Todas</button>
                             </div>
                             <div className="grid gap-4">
                                {receitas.map(r => (
                                    <div key={r.id} className="bg-white/5 p-5 rounded-[2rem] flex items-center justify-between border border-transparent hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 font-black text-[10px]">{r.nome.charAt(0)}</div>
                                            <p className="font-bold text-sm tracking-tight">{r.nome}</p>
                                        </div>
                                        <p className="text-xs font-black text-[#D4AF37]">{r.preco_sugerido ? MathSkill.formatarMoeda(r.preco_sugerido / r.rendimento) : '—'}</p>
                                    </div>
                                ))}
                                {receitas.length === 0 && <p className="text-center text-white/10 text-[10px] font-black uppercase tracking-widest py-10 opacity-50 border-2 border-dashed border-white/5 rounded-[2rem]">Nenhuma receita calculada ainda</p>}
                             </div>
                        </div>
                    </motion.div>
                )}

                {view === 'wizard' && <PricingWizardAgent insumos={insumos} config={config} onSalvar={salvarReceita} onVoltar={() => setView('dashboard')} />}
                {view === 'inventory' && <InventoryAgent insumos={insumos} onAdicionar={salvarInsumo} onExcluir={excluirInsumo} onVoltar={() => setView('dashboard')} />}
                {view === 'production' && <ProductionAgent receitas={receitas} insumos={insumos} onVoltar={() => setView('dashboard')} />}
                {view === 'settings' && <FinanceAgent config={config} setConfig={setConfig} user={user} supabase={supabase} onVoltar={() => setView('dashboard')} />}
            </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-10 py-8 flex justify-between items-center z-[100] rounded-t-[3rem]">
            {[
                { id: 'dashboard', icon: LayoutDashboard },
                { id: 'inventory', icon: Package },
                { id: 'production', icon: ShoppingBag },
                { id: 'settings', icon: Settings }
            ].map(item => (
                <button key={item.id} onClick={() => setView(item.id as any)} className={`transition-all ${view === item.id ? "text-[#D4AF37] scale-125" : "text-white/20 hover:text-white/40"}`}>
                    <item.icon size={24} />
                    {view === item.id && <motion.div layoutId="navDot" className="h-1 w-1 bg-[#D4AF37] rounded-full mx-auto mt-2" />}
                </button>
            ))}
        </nav>
      </div>
    </div>
  );
}
