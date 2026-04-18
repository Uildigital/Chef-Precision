"use client";
import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  ChefHat, 
  LayoutDashboard, 
  ShoppingBag, 
  BookOpen, 
  Settings,
  X,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// Agents
import { LandingAgent } from "@/components/agents/LandingAgent";
import { InventoryAgent } from "@/components/agents/InventoryAgent";
import { RecipeAgent } from "@/components/agents/RecipeAgent";
import { ProductionAgent } from "@/components/agents/ProductionAgent";
import { FinanceAgent } from "@/components/agents/FinanceAgent";

// Types
export interface Insumo {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: 'g' | 'ml' | 'un';
}

export interface ItemReceita {
  id_insumo: string;
  quantidade_usada: number;
}

export interface Receita {
  id: string;
  nome: string;
  itens: ItemReceita[];
  rendimento: number;
  margem_desejada: number;
  tempo_preparo: number;
  tempo_forno: number;
}

export default function ChefPrecision() {
  const [abaAtiva, setAbaAtiva] = useState<'home' | 'receitas' | 'insumos' | 'config' | 'planejamento'>('home');
  const [receitaEmEdicao, setReceitaEmEdicao] = useState<Receita | null>(null);
  const [isMenuAberto, setIsMenuAberto] = useState(false);
  
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [config, setConfig] = useState({ 
    mao_de_obra: 0, 
    taxa_fixa: 10,
    salario_desejado: 2500,
    horas_trabalhadas_mes: 160,
    contas: { luz: 150, agua: 80, gas: 120, internet: 100, outros: 0 }
  });
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // --- Initial Load ---
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
        if (localConf) {
            const parsed = JSON.parse(localConf);
            setConfig(prev => ({ ...prev, ...parsed, contas: { ...prev.contas, ...parsed.contas } }));
        }
      }
    };
    init();
  }, [supabase]);

  const carregarDados = async (userId: string) => {
    const { data: dIns } = await supabase.from('ingredients').select('*').eq('user_id', userId);
    if (dIns) setInsumos(dIns);
    const { data: dRec } = await supabase.from('recipes').select('*').eq('user_id', userId);
    if (dRec) {
        setReceitas(dRec.map((r: any) => ({
            id: r.id,
            nome: r.name,
            itens: r.ingredients || [],
            rendimento: r.yield || 1,
            margem_desejada: r.markup || 3,
            tempo_preparo: r.prep_time || 0,
            tempo_forno: r.oven_time || 0
        })));
    }
    const { data: dConf } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
    if (dConf) {
        setConfig(prev => ({ 
            ...prev,
            mao_de_obra: dConf.mao_de_obra ?? prev.mao_de_obra, 
            taxa_fixa: dConf.taxa_fixa ?? prev.taxa_fixa,
            salario_desejado: dConf.salario_desejado ?? prev.salario_desejado,
            horas_trabalhadas_mes: dConf.horas_trabalhadas_mes ?? prev.horas_trabalhadas_mes,
            contas: { ...prev.contas, ...(dConf.contas || {}) }
        }));
    }
  };

  const salvarInsumo = async (novo: Omit<Insumo, 'id'>) => {
    if (!user) {
        const item = { ...novo, id: Date.now().toString() };
        const lista = [...insumos, item as any];
        setInsumos(lista);
        localStorage.setItem("chef-insumos", JSON.stringify(lista));
        return;
    }
    const { data } = await supabase.from('ingredients').insert([{ ...novo, user_id: user.id }]).select();
    if (data) setInsumos([...insumos, data[0]]);
  };

  const excluirInsumo = async (id: string) => {
    if (user) await supabase.from('ingredients').delete().eq('id', id);
    const lista = insumos.filter(i => i.id !== id);
    setInsumos(lista);
    localStorage.setItem("chef-insumos", JSON.stringify(lista));
  };

  const salvarReceitaCompleta = async (nova: Omit<Receita, 'id'>) => {
    if (!user) {
        const item = { ...nova, id: Date.now().toString() };
        const lista = [...receitas, item as any];
        setReceitas(lista);
        localStorage.setItem("chef-receitas", JSON.stringify(lista));
        return;
    }
    const { data } = await supabase.from('recipes').insert([{
        name: nova.nome,
        ingredients: nova.itens,
        yield: nova.rendimento,
        markup: nova.margem_desejada,
        prep_time: nova.tempo_preparo,
        oven_time: nova.tempo_forno,
        user_id: user.id
    }]).select();
    if (data) carregarDados(user.id);
  };

  const excluirReceita = async (id: string) => {
    if (user) await supabase.from('recipes').delete().eq('id', id);
    const lista = receitas.filter(r => r.id !== id);
    setReceitas(lista);
    localStorage.setItem("chef-receitas", JSON.stringify(lista));
  };

  const carregarDemo = () => {
    const demoInsumos: Insumo[] = [
        { id: '1', name: 'Leite Condensado', price: 7.50, quantity: 395, unit: 'g' },
        { id: '2', name: 'Creme de Leite', price: 4.80, quantity: 200, unit: 'g' },
        { id: '3', name: 'Chocolate 50%', price: 32.00, quantity: 1000, unit: 'g' },
        { id: '5', name: 'Manteiga', price: 12.00, quantity: 200, unit: 'g' },
    ];
    const demoReceita: Receita = {
        id: '101', nome: 'Brigadeiro Belga',
        itens: [{ id_insumo: '1', quantidade_usada: 395 }, { id_insumo: '2', quantidade_usada: 100 }, { id_insumo: '3', quantidade_usada: 30 }, { id_insumo: '5', quantidade_usada: 15 }],
        rendimento: 25, margem_desejada: 3.5, tempo_preparo: 45, tempo_forno: 0
    };
    setInsumos(demoInsumos); setReceitas([demoReceita]);
    localStorage.setItem("chef-insumos", JSON.stringify(demoInsumos));
    localStorage.setItem("chef-receitas", JSON.stringify([demoReceita]));
    setAbaAtiva('receitas');
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFB] text-[#2D2424] font-sans">
      {/* Sidebar Agent */}
      <AnimatePresence>
        {isMenuAberto && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-y-0 left-0 w-72 bg-[#1A1A1A] text-white z-[100] p-8 flex flex-col shadow-2xl">
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3"><ChefHat className="text-[#D4AF37]" size={28} /><span className="font-black text-lg tracking-tighter">CHEF<span className="text-[#D4AF37]">PRECISION</span></span></div>
                <button onClick={() => setIsMenuAberto(false)}><X size={20}/></button>
             </div>
             <nav className="flex-1 space-y-2">
                {[
                  { id: 'home', label: 'Painel Geral', icon: LayoutDashboard },
                  { id: 'insumos', label: 'Meus Ingredientes', icon: ShoppingBag },
                  { id: 'receitas', label: 'Minhas Receitas', icon: BookOpen },
                  { id: 'planejamento', label: 'Lista de Compras', icon: Calculator },
                  { id: 'config', label: 'Configurações', icon: Settings }
                ].map((item) => (
                  <button key={item.id} onClick={() => { setAbaAtiva(item.id as any); setIsMenuAberto(false); setReceitaEmEdicao(null); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${abaAtiva === item.id ? "bg-[#D4AF37] text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                    <item.icon size={18} />
                    <span className="text-[10px] uppercase font-black tracking-widest">{item.label}</span>
                  </button>
                ))}
             </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
          <header className={`px-6 py-6 bg-white border-b border-[#E5E5E5] flex items-center justify-between sticky top-0 z-50 ${abaAtiva === 'home' ? "hidden" : "flex"}`}>
             <button onClick={() => setIsMenuAberto(true)} className="h-12 w-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-black active:scale-95 transition-all"><Menu size={20}/></button>
             <div className="text-center"><span className="text-[9px] font-black uppercase text-[#D4AF37] tracking-[0.3em] block mb-0.5">Gestão Expert</span><h2 className="text-xs font-black uppercase tracking-widest">Ateliê Digital</h2></div>
             <div className="h-12 w-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] font-black text-xs border border-[#D4AF37]/20">{user?.email?.charAt(0).toUpperCase() || "U"}</div>
          </header>

          <main className="flex-1 overflow-y-auto">
             <AnimatePresence mode="wait">
                {abaAtiva === 'home' && <LandingAgent onStart={() => setAbaAtiva('receitas')} onDemo={carregarDemo} />}
                {abaAtiva === 'insumos' && <InventoryAgent insumos={insumos} onAdicionar={salvarInsumo} onExcluir={excluirInsumo} />}
                {abaAtiva === 'receitas' && <RecipeAgent receitas={receitas} insumos={insumos} onVisualizar={setReceitaEmEdicao} onSalvar={salvarReceitaCompleta} onExcluir={excluirReceita} receitaEmEdicao={receitaEmEdicao} onVoltar={() => setReceitaEmEdicao(null)} config={config} />}
                {abaAtiva === 'planejamento' && <ProductionAgent receitas={receitas} insumos={insumos} />}
                {abaAtiva === 'config' && <FinanceAgent config={config} setConfig={setConfig} user={user} supabase={supabase} />}
             </AnimatePresence>
          </main>
      </div>
    </div>
  );
}
