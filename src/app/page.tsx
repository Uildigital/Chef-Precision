"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calculator, 
  ChefHat, 
  ChevronRight, 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  Settings,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  FileText,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  PieChart,
  ShoppingBag,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import jsPDF from "jspdf";
import "jspdf-autotable";

// --- Tipagens Focadas em Confeitaria ---
interface Insumo {
  id: string;
  name: string;
  price: number;
  quantity: number; // Volume que vem na embalagem (ex: 395g)
  unit: 'g' | 'ml' | 'un';
}

interface ItemReceita {
  id_insumo: string;
  quantidade_usada: number;
}

interface Receita {
  id: string;
  nome: string;
  itens: ItemReceita[];
  rendimento: number; // Quantas unidades ou fatias rende
  margem_desejada: number; // Markup
}

export default function ChefPrecision() {
  const [abaAtiva, setAbaAtiva] = useState<'home' | 'receitas' | 'insumos' | 'config'>('home');
  const [receitaEmEdicao, setReceitaEmEdicao] = useState<Receita | null>(null);
  const [isMenuAberto, setIsMenuAberto] = useState(false);
  
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [config, setConfig] = useState({ mao_de_obra: 0, taxa_fixa: 10 });
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // --- Lógica de Inicialização ---
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
  }, []);

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
            margem_desejada: r.markup || 3
        })));
    }
    const { data: dConf } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
    if (dConf) setConfig({ mao_de_obra: dConf.mao_de_obra, taxa_fixa: dConf.taxa_fixa });
  };

  // --- Funções de Salvamento ---
  const salvarInsumo = async (novo: Omit<Insumo, 'id'>) => {
    if (!user) {
        const item = { ...novo, id: Date.now().toString() };
        const lista = [...insumos, item];
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
        const lista = [...receitas, item];
        setReceitas(lista);
        localStorage.setItem("chef-receitas", JSON.stringify(lista));
        return;
    }
    const { data } = await supabase.from('recipes').insert([{
        name: nova.nome,
        ingredients: nova.itens,
        yield: nova.rendimento,
        markup: nova.margem_desejada,
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
        { id: '1', name: 'Leite Condensado (Moça)', price: 7.50, quantity: 395, unit: 'g' },
        { id: '2', name: 'Creme de Leite (Nestlé)', price: 4.80, quantity: 200, unit: 'g' },
        { id: '3', name: 'Chocolate em Pó 50%', price: 32.00, quantity: 1000, unit: 'g' },
        { id: '4', name: 'Granulado Gourmet', price: 45.00, quantity: 1000, unit: 'g' },
        { id: '5', name: 'Manteiga Sem Sal', price: 12.00, quantity: 200, unit: 'g' },
    ];

    const demoReceita: Receita = {
        id: '101',
        nome: 'Brigadeiro Belga Tradicional',
        itens: [
            { id_insumo: '1', quantidade_usada: 395 },
            { id_insumo: '2', quantidade_usada: 100 },
            { id_insumo: '3', quantidade_usada: 30 },
            { id_insumo: '5', quantidade_usada: 15 },
        ],
        rendimento: 25,
        margem_desejada: 3.5
    };

    setInsumos(demoInsumos);
    setReceitas([demoReceita]);
    localStorage.setItem("chef-insumos", JSON.stringify(demoInsumos));
    localStorage.setItem("chef-receitas", JSON.stringify([demoReceita]));
    setAbaAtiva('receitas');
    alert("✨ Modo Demo Ativado! Veja suas receitas agora.");
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFB] text-[#2D2424] font-sans">
      {/* Menu Lateral Profissional */}
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
                  { id: 'config', label: 'Configurações', icon: Settings }
                ].map((item) => (
                  <button key={item.id} onClick={() => { setAbaAtiva(item.id as any); setIsMenuAberto(false); setReceitaEmEdicao(null); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${abaAtiva === item.id ? "bg-[#D4AF37] text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                    <item.icon size={18} />
                    <span className="text-[10px] uppercase font-black tracking-widest">{item.label}</span>
                  </button>
                ))}
             </nav>
             <div className="mt-auto pt-8 border-t border-white/5 opacity-20 text-center text-[8px] font-bold uppercase tracking-[0.4em]">Ateliê Digital v2.0</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
          {/* Header de Navegação */}
          <header className={`px-6 py-6 bg-white border-b border-[#E5E5E5] flex items-center justify-between sticky top-0 z-50 ${abaAtiva === 'home' ? "hidden" : "flex"}`}>
             <button onClick={() => setIsMenuAberto(true)} className="h-12 w-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-black active:scale-95 transition-all"><Menu size={20}/></button>
             <div className="text-center">
                <span className="text-[9px] font-black uppercase text-[#D4AF37] tracking-[0.3em] block mb-0.5">Gestão de Confeitaria</span>
                <h2 className="text-xs font-black uppercase tracking-widest">Calculadora Expert</h2>
             </div>
             <div className="h-12 w-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] font-black text-xs border border-[#D4AF37]/20">
                {user?.email?.charAt(0).toUpperCase() || "U"}
             </div>
          </header>

          <main className="flex-1 overflow-y-auto">
             <AnimatePresence mode="wait">
                {abaAtiva === 'home' && <HomeView onStart={() => setAbaAtiva('receitas')} onDemo={carregarDemo} />}
                {abaAtiva === 'receitas' && !receitaEmEdicao && <ReceitasView receitas={receitas} insumos={insumos} onNovo={() => setAbaAtiva('receitas')} onExcluir={excluirReceita} onVisualizar={setReceitaEmEdicao} onSalvar={salvarReceitaCompleta} />}
                {abaAtiva === 'receitas' && receitaEmEdicao && <DetalheCalculo receita={receitaEmEdicao} insumos={insumos} config={config} onVoltar={() => setReceitaEmEdicao(null)} />}
                {abaAtiva === 'insumos' && <InsumosView insumos={insumos} onAdicionar={salvarInsumo} onExcluir={excluirInsumo} />}
                {abaAtiva === 'config' && <ConfigView config={config} setConfig={setConfig} user={user} supabase={supabase} />}
             </AnimatePresence>
          </main>
      </div>
    </div>
  );
}

// --- VISÕES REFORMULADAS ---

function HomeView({ onStart, onDemo }: any) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[150px] rounded-full" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 bg-white/5 backdrop-blur-xl p-10 rounded-[4rem] border border-white/10 shadow-3xl mb-10">
                <ChefHat size={60} className="text-[#D4AF37] mb-6 mx-auto" />
                <h1 className="text-5xl font-black text-white leading-none tracking-tighter uppercase mb-6 italic">Chef<br/><span className="text-[#D4AF37] not-italic">Precision</span></h1>
                <p className="text-white/40 text-sm max-w-sm font-medium leading-relaxed italic mb-10">Transforme suas receitas em lucro real. Simples, rápido e profissional.</p>
                <div className="flex flex-col gap-4">
                    <button onClick={onStart} className="w-full px-12 py-6 bg-[#D4AF37] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all mx-auto">Precificar Agora <ChevronRight size={16}/></button>
                    <button onClick={onDemo} className="w-full px-12 py-6 bg-white/5 text-white/40 border border-white/10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">Ver Exemplo de Ateliê <Sparkles size={14}/></button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function InsumosView({ insumos, onAdicionar, onExcluir }: any) {
    const [isAdd, setIsAdd] = useState(false);
    const [form, setForm] = useState({ name: '', price: 0, quantity: 1, unit: 'un' });

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-3xl mx-auto pb-32">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black tracking-tighter">Ingredientes</h2>
                <button onClick={() => setIsAdd(true)} className="h-14 w-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Plus/></button>
            </div>

            <AnimatePresence>
                {isAdd && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-black/5 space-y-6">
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Nome do Produto</label><input type="text" placeholder="Leite Condensado 395g" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Preço Pago (R$)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm" /></div>
                            <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Unidade/Peso</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setIsAdd(false)} className="py-5 bg-[#F5F5F5] text-black/40 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                            <button onClick={() => { onAdicionar(form); setIsAdd(false); setForm({ name: '', price: 0, quantity: 1, unit: 'un' }); }} className="py-5 bg-[#D4AF37] text-white font-black text-[10px] uppercase rounded-2xl shadow-xl">Cadastrar</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {insumos.map((i: Insumo) => (
                    <div key={i.id} className="bg-white p-5 rounded-[2rem] shadow-md flex items-center justify-between group border border-transparent hover:border-[#D4AF37]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-xs font-black uppercase text-black/40">{i.unit}</div>
                            <div><h4 className="font-extrabold text-sm">{i.name}</h4><p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">R$ {i.price.toFixed(2)} por {i.quantity}</p></div>
                        </div>
                        <button onClick={() => onExcluir(i.id)} className="h-10 w-10 text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function ReceitasView({ receitas, insumos, onVisualizar, onSalvar, onExcluir }: any) {
    const [isNovo, setIsNovo] = useState(false);
    const [novo, setNovo] = useState<Partial<Receita>>({ nome: '', itens: [], rendimento: 1, margem_desejada: 3 });
    const [selId, setSelId] = useState("");
    const [selQt, setSelQt] = useState(0);

    const addItem = () => {
        if (!selId || selQt <= 0) return;
        setNovo({...novo, itens: [...(novo.itens || []), { id_insumo: selId, quantidade_usada: selQt }]});
        setSelId(""); setSelQt(0);
    };

    const totalCusto = (itens: ItemReceita[]) => {
        return itens.reduce((acc, curr) => {
            const ins = insumos.find((i: any) => i.id === curr.id_insumo);
            return acc + (ins ? (ins.price / ins.quantity) * curr.quantidade_usada : 0);
        }, 0);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-4xl mx-auto pb-32">
            <header className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black tracking-tighter">Minhas Fichas</h2>
                <button onClick={() => setIsNovo(true)} className="h-14 w-14 bg-[#D4AF37] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Plus/></button>
            </header>

            <AnimatePresence>
                {isNovo && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1 }} className="mb-12 bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-[#FDFCFB] space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em] pl-2 border-l-4 border-[#D4AF37]">Dados da Receita</h3>
                            <input type="text" placeholder="Ex: Bolo de Brigadeiro Belga" value={novo.nome} onChange={e => setNovo({...novo, nome: e.target.value})} className="w-full bg-[#F5F5F5] p-6 rounded-2xl outline-none font-black text-sm" />
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/30 pl-2">Quanto rende? (un/kg/fatias)</label><input type="number" value={novo.rendimento} onChange={e => setNovo({...novo, rendimento: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" /></div>
                               <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/30 pl-2">Margem de Lucro (Ex: 3)</label><input type="number" value={novo.margem_desejada} onChange={e => setNovo({...novo, margem_desejada: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" /></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em] pl-2 border-l-4 border-[#D4AF37]">Ingredientes Usados</h3>
                            <div className="flex gap-2">
                                <select value={selId} onChange={e => setSelId(e.target.value)} className="flex-1 bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-xs">
                                    <option value="">Buscar Ingrediente...</option>
                                    {insumos.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <input type="number" placeholder="Qtd" value={selQt} onChange={e => setSelQt(parseFloat(e.target.value))} className="w-24 bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-xs" />
                                <button onClick={addItem} className="h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all"><Plus size={20}/></button>
                            </div>
                            <div className="space-y-2">
                                {novo.itens?.map((it, idx) => (
                                    <div key={idx} className="flex justify-between p-4 bg-[#F5F5F5] rounded-xl font-bold text-xs text-black/40"><span>{insumos.find((i:any)=>i.id === it.id_insumo)?.name}</span><span>{it.quantidade_usada}</span></div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setIsNovo(false)} className="py-5 bg-[#F5F5F5] text-black/40 font-black text-[10px] uppercase rounded-2xl">Descartar</button>
                            <button onClick={() => { onSalvar(novo); setIsNovo(false); }} className="py-5 bg-black text-white font-black text-[10px] uppercase rounded-2xl shadow-xl flex items-center justify-center gap-2"><Sparkles size={14}/> Salvar Receita</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {receitas.map((r: Receita) => (
                    <div key={r.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-black/5 flex flex-col justify-between group active:scale-95 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black italic">{r.nome}</h3>
                            <button onClick={() => onExcluir(r.id)} className="h-10 w-10 text-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                        <div className="flex items-end justify-between">
                            <div><span className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em] block">Custo p/{r.rendimento > 1 ? "Batida" : "Unid"}</span><p className="text-lg font-black">R$ {totalCusto(r.itens).toFixed(2)}</p></div>
                            <button onClick={() => onVisualizar(r)} className="h-14 w-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all"><ChevronRight/></button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function DetalheCalculo({ receita, insumos, config, onVoltar }: any) {
    const custoLata = receita.itens.reduce((acc: any, curr: any) => {
        const ins = insumos.find((i: any) => i.id === curr.id_insumo);
        return acc + (ins ? (ins.price / ins.quantity) * curr.quantidade_usada : 0);
    }, 0);
    
    const custoEstrutural = custoLata * (config.taxa_fixa / 100);
    const custoTotal = custoLata + custoEstrutural;
    const precoSugerido = custoTotal * receita.margem_desejada;

    return (
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="p-6 max-w-4xl mx-auto pb-40">
            <button onClick={onVoltar} className="mb-8 flex items-center gap-2 text-[10px] font-black opacity-20 uppercase tracking-widest"><ArrowLeft size={16}/> Voltar</button>
            <div className="bg-white p-10 rounded-[4rem] shadow-3xl border border-black/5 space-y-12">
                <header className="text-center">
                    <h2 className="text-4xl font-black italic mb-3">{receita.nome}</h2>
                    <div className="flex justify-center gap-3"><span className="px-4 py-2 bg-[#F5F5F5] rounded-full text-[9px] font-bold uppercase tracking-widest">Rende {receita.rendimento} uni</span></div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-8 bg-[#F5F5F5] rounded-[3rem] text-center">
                        <span className="text-[10px] font-black uppercase text-black/30 tracking-widest block mb-1">Custo da Receita</span>
                        <p className="text-3xl font-black">R$ {custoTotal.toFixed(2)}</p>
                    </div>
                    <div className="p-8 bg-[#D4AF37] rounded-[3rem] text-center text-white shadow-2xl">
                        <span className="text-[10px] font-black uppercase text-white/50 tracking-widest block mb-1">Custo por Unidade</span>
                        <p className="text-3xl font-black">R$ {(custoTotal / receita.rendimento).toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-[#1A1A1A] text-white p-12 rounded-[4rem] flex flex-col items-center gap-6 relative overflow-hidden text-center">
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-4 block">Preço de Venda Sugerido</span>
                        <h3 className="text-7xl font-black text-white italic">R$ {precoSugerido.toFixed(2)}</h3>
                        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] mt-6">Considerando lucro de 100% sobre o custo + {config.taxa_fixa}% de fixos</p>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] opacity-5 rotate-12"><DollarSign size={200}/></div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] pl-4">Lista de Materiais</h4>
                   <div className="grid gap-2">
                       {receita.itens.map((it:any, idx:number) => {
                           const ins = insumos.find((i:any)=>i.id === it.id_insumo);
                           return (
                               <div key={idx} className="flex justify-between p-5 bg-[#FDFCFB] border border-black/5 rounded-2xl items-center">
                                   <span className="text-xs font-bold">{ins?.name} <span className="text-[10px] opacity-20 ml-2">({it.quantidade_usada} {ins?.unit})</span></span>
                                   <span className="text-xs font-black">R$ {((ins?.price / ins?.quantity) * it.quantidade_usada).toFixed(2)}</span>
                               </div>
                           )
                       })}
                   </div>
                </div>
            </div>
        </motion.div>
    );
}

function ConfigView({ config, setConfig, user, supabase }: any) {
    const handleSave = async () => {
        if (!user) {
            localStorage.setItem("chef-config", JSON.stringify(config));
            alert("Salvo no navegador!"); return;
        }
        await supabase.from('user_settings').upsert({ user_id: user.id, ...config });
        alert("Sincronizado na Nuvem!");
    };

    return (
        <div className="p-10 max-w-xl mx-auto py-24 text-center">
            <h2 className="text-4xl font-black tracking-tighter mb-12 italic">Configurações Master</h2>
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-black/5 space-y-8">
                <div className="flex flex-col gap-2 text-left"><label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Mão de Obra (R$/Hora)</label><input type="number" value={config.mao_de_obra} onChange={e => setConfig({...config, mao_de_obra: parseFloat(e.target.value)})} className="bg-[#F5F5F5] p-6 rounded-2xl outline-none font-black text-sm" /></div>
                <div className="flex flex-col gap-2 text-left"><label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Rateio Gás/Luz (%)</label><input type="number" value={config.taxa_fixa} onChange={e => setConfig({...config, taxa_fixa: parseFloat(e.target.value)})} className="bg-[#F5F5F5] p-6 rounded-2xl outline-none font-black text-sm" /></div>
                <button onClick={handleSave} className="w-full py-6 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"><Zap size={16} className="text-[#D4AF37]"/> Salvar Preferências</button>
            </div>
        </div>
    );
}
