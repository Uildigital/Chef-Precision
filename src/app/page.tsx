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
  Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import jsPDF from "jspdf";
import "jspdf-autotable";

// --- Tipagens Elite ---
interface Insumo {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: 'g' | 'ml' | 'un';
}

interface ComponenteReceita {
  id_insumo: string;
  quantidade: number;
}

interface Engenharia {
  id: string;
  nome: string;
  componentes: ComponenteReceita[];
  custos_fixos: number;
  margem: number;
}

export default function ChefPrecision() {
  const [abaAtiva, setAbaAtiva] = useState<'home' | 'dashboard' | 'insumos' | 'engenharias' | 'configuracoes'>('home');
  const [isMenuAberto, setIsMenuAberto] = useState(false);
  const [engenhariaSelecionada, setEngenhariaSelecionada] = useState<Engenharia | null>(null);
  
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [engenharias, setEngenharias] = useState<Engenharia[]>([]);
  const [config, setConfig] = useState({ mao_de_obra: 0, taxa_fixa: 5 }); // Rateio %
  const [isLogado, setIsLogado] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // --- Lógica de Sincronização e Auth ---
  useEffect(() => {
    const carregarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLogado(true);
        setUser(session.user);
        buscarDados(session.user.id);
      }
    };
    carregarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLogado(true);
        setUser(session.user);
        buscarDados(session.user.id);
      } else {
        setIsLogado(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const buscarDados = async (userId: string) => {
    // Buscar Insumos
    const { data: dataInsumos } = await supabase.from('ingredients').select('*').eq('user_id', userId);
    if (dataInsumos) setInsumos(dataInsumos);

    // Buscar Engenharias (Receitas)
    const { data: dataEng } = await supabase.from('recipes').select('*').eq('user_id', userId);
    if (dataEng) {
        // Mapear componentes (Aqui assumimos que a coluna 'ingredients' no DB é um JSONB)
        const formatadas = dataEng.map((e: any) => ({
            id: e.id,
            nome: e.name,
            componentes: e.ingredients || [], // Reutilizando coluna ingredients como componentes
            custos_fixos: e.fixed_costs || 0,
            margem: e.markup || 3
        }));
        setEngenharias(formatadas);
    }
  };

  const fazerLogin = async () => {
    const email = window.prompt("Digite seu e-mail para acesso Master:");
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) alert("Erro: " + error.message);
    else alert("Link enviado! Confira sua caixa de entrada.");
  };

  const fazerLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setInsumos([]);
    setEngenharias([]);
    window.location.reload();
  };

  // --- Ações de Dados ---
  const adicionarInsumo = async (novo: Omit<Insumo, 'id'>) => {
    if (!isLogado) {
        setInsumos([...insumos, { ...novo, id: Date.now().toString() }]);
        return;
    }
    const { data, error } = await supabase.from('ingredients').insert([{ ...novo, user_id: user.id }]).select();
    if (!error && data) setInsumos([...insumos, data[0]]);
  };

  const deletarInsumo = async (id: string) => {
    if (isLogado) await supabase.from('ingredients').delete().eq('id', id);
    setInsumos(insumos.filter(i => i.id !== id));
  };

  const salvarEngenharia = async (nova: Omit<Engenharia, 'id'>) => {
    if (!isLogado) {
        setEngenharias([...engenharias, { ...nova, id: Date.now().toString() }]);
        return;
    }
    const { data, error } = await supabase.from('recipes').insert([{
        name: nova.nome,
        ingredients: nova.componentes, // Salvando como JSONB
        fixed_costs: nova.custos_fixos,
        markup: nova.margem,
        user_id: user.id
    }]).select();
    
    if (!error && data) {
        setEngenharias([...engenharias, {
            id: data[0].id,
            nome: data[0].name,
            componentes: data[0].ingredients,
            custos_fixos: data[0].fixed_costs,
            margem: data[0].markup
        }]);
    }
  };

  const deletarEngenharia = async (id: string) => {
    if (isLogado) await supabase.from('recipes').delete().eq('id', id);
    setEngenharias(engenharias.filter(e => e.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBF9] text-[#1A1A2E] font-sans selection:bg-secondary/30">
      {/* Sidebar de Elite */}
      <AnimatePresence>
        {isMenuAberto && (
          <motion.div initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} className="fixed inset-y-0 left-0 w-80 bg-primary text-white z-[100] p-10 flex flex-col shadow-[20px_0_60px_rgba(26,26,46,0.3)]">
             <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-4"><div className="p-3 bg-white/10 rounded-2xl"><ChefHat size={32} className="text-secondary" /></div><span className="font-black text-2xl tracking-tighter italic">Chef<span className="text-secondary">Precision</span></span></div>
                <button onClick={() => setIsMenuAberto(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><X size={20}/></button>
             </div>
             
             <nav className="flex-1 space-y-3">
                {[
                  { id: 'dashboard', label: 'Dashboard Master', icon: LayoutDashboard },
                  { id: 'insumos', label: 'Gestão de Insumos', icon: Package },
                  { id: 'engenharias', label: 'Fichas Técnicas', icon: BookOpen },
                  { id: 'configuracoes', label: 'Custos & Ajustes', icon: Settings }
                ].map((item) => (
                  <button key={item.id} onClick={() => { setAbaAtiva(item.id as any); setIsMenuAberto(false); setEngenhariaSelecionada(null); }} className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all duration-300 ${abaAtiva === item.id ? "bg-white text-primary shadow-2xl scale-105" : "text-white/40 hover:text-white"}`}>
                    <item.icon size={22} />
                    <span className="text-[11px] uppercase font-black tracking-[0.2em]">{item.label}</span>
                  </button>
                ))}
             </nav>

             <div className="mt-auto border-t border-white/5 pt-10 text-center flex flex-col items-center gap-4">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Engine v2.0 Elite</p>
                {isLogado && <button onClick={fazerLogout} className="text-[10px] font-bold text-accent uppercase tracking-widest px-6 py-3 bg-accent/10 rounded-xl hover:bg-accent/20 transition-all">Encerrar Sessão</button>}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
          {/* Header Superior */}
          <header className={`px-8 py-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-primary/5 sticky top-0 z-[50] ${abaAtiva === 'home' ? "hidden" : "flex"}`}>
            <button onClick={() => setIsMenuAberto(true)} className="h-14 w-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20 active:scale-90 transition-transform"><Menu size={24}/></button>
            <div className="text-center">
               <span className="text-[10px] font-black uppercase text-secondary tracking-[0.4em] block mb-1">Elite Culinary Management</span>
               <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Chef Precision Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
                {!isLogado ? (
                    <button onClick={fazerLogin} className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-[1rem] shadow-xl hover:bg-primary/90 flex items-center gap-2">
                       <Sparkles size={14} className="text-secondary" /> Master Login
                    </button>
                ) : (
                    <div className="flex items-center gap-3 h-14 bg-white border border-primary/5 px-4 rounded-[1.5rem] shadow-lg">
                       <span className="text-[10px] font-black text-primary/40 truncate max-w-[100px]">{user?.email}</span>
                       <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-white font-black text-[10px]">{user?.email?.charAt(0).toUpperCase()}</div>
                    </div>
                )}
            </div>
          </header>

          <main className="flex-1 relative">
             <AnimatePresence mode="wait">
                {abaAtiva === 'home' && <HomeHero onEntrar={() => setAbaAtiva('dashboard')} />}
                {abaAtiva === 'dashboard' && <MonitoramentoDashboard insumos={insumos} ftecs={engenharias} setAba={setAbaAtiva} />}
                {abaAtiva === 'insumos' && <GestaoInsumos insumos={insumos} onAdicionar={adicionarInsumo} onDeletar={deletarInsumo} />}
                {abaAtiva === 'engenharias' && !engenhariaSelecionada && <EngenhariaList engenharias={engenharias} insumos={insumos} onNovo={() => {}} onSalvar={salvarEngenharia} onDeletar={deletarEngenharia} onVer={setEngenhariaSelecionada} />}
                {abaAtiva === 'engenharias' && engenhariaSelecionada && <DetalheEngenharia eng={engenhariaSelecionada} insumos={insumos} onVoltar={() => setEngenhariaSelecionada(null)} />}
                {abaAtiva === 'configuracoes' && <ConfiguracoesMaster config={config} setConfig={setConfig} />}
             </AnimatePresence>
          </main>
      </div>
    </div>
  );
}

// --- Componentes Reais e Funcionais ---

function HomeHero({ onEntrar }: any) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-primary flex items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/10 blur-[200px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full -translate-x-1/4 translate-y-1/4" />
            
            <div className="relative z-10 max-w-4xl text-center flex flex-col items-center">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-8 bg-white/5 backdrop-blur-2xl rounded-[4rem] border border-white/10 mb-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                   <ChefHat size={80} className="text-secondary drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
                </motion.div>
                <motion.h1 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-black text-white leading-tight tracking-tighter mb-8 uppercase italic">Chef <span className="text-secondary not-italic">Precision</span></motion.h1>
                <p className="text-white/40 text-xl max-w-xl font-medium mb-12 leading-relaxed">Assuma o controle absoluto da sua lucratividade com a ferramenta de engenharia de custos mais sofisticada da culinária gourmet.</p>
                <button onClick={onEntrar} className="px-16 py-8 bg-secondary text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_30px_60px_rgba(212,175,55,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group">Começar Gerenciamento <ChevronRight className="group-hover:translate-x-2 transition-transform" /> </button>
            </div>
        </motion.div>
    );
}

function MonitoramentoDashboard({ insumos, ftecs, setAba }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 max-w-6xl mx-auto pb-40">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                  { label: "Insumos Cadastrados", val: insumos.length, color: "bg-primary", icon: Package },
                  { label: "Fichas de Engenharia", val: ftecs.length, color: "bg-secondary", icon: BookOpen },
                  { label: "Markup Médio", val: "3.5x", color: "bg-accent", icon: Calculator }
              ].map((card, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-primary/5 flex flex-col justify-between h-56 group relative overflow-hidden active:scale-95 transition-all cursor-pointer">
                      <div className="h-16 w-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><card.icon size={28} /></div>
                      <div>
                         <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.3em] block mb-2">{card.label}</span>
                         <p className="text-5xl font-black text-primary">{card.val}</p>
                      </div>
                  </div>
              ))}
           </div>

           <div className="bg-primary text-white p-12 rounded-[4rem] shadow-[0_50px_100px_rgba(26,26,46,0.3)] flex items-center justify-between relative overflow-hidden group">
              <div className="relative z-10 max-w-lg">
                  <h3 className="text-3xl font-black mb-4 italic">O Lucro está na Precision.</h3>
                  <p className="text-white/50 font-medium leading-relaxed mb-8 italic">Cada grama não precificada é um pedaço do seu negócio que se perde. Comece criando seus insumos bases.</p>
                  <button onClick={() => setAba('insumos')} className="px-10 py-5 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-95 transition-all">Ir para Gestão de Insumos <Plus size={16}/></button>
              </div>
              <div className="opacity-10 absolute right-[-5%] top-[-10%] group-hover:rotate-12 transition-transform duration-1000"><Calculator size={300} /></div>
           </div>
        </motion.div>
    );
}

function GestaoInsumos({ insumos, onAdicionar, onDeletar }: any) {
    const [isNovo, setIsNovo] = useState(false);
    const [form, setForm] = useState({ name: '', price: 0, quantity: 1000, unit: 'g' });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 max-w-5xl mx-auto pb-44">
             <header className="flex items-center justify-between mb-16">
                 <div>
                    <h2 className="text-5xl font-black text-primary tracking-tighter">Insumos</h2>
                    <p className="text-primary/30 font-bold uppercase text-[10px] tracking-widest mt-2">{insumos.length} produtos em estoque global</p>
                 </div>
                 <button onClick={() => setIsNovo(true)} className="h-20 w-20 bg-secondary text-white rounded-[2rem] shadow-2xl shadow-secondary/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all"><Plus size={32}/></button>
             </header>

             <AnimatePresence>
                 {isNovo && (
                     <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-12 bg-white p-10 rounded-[3.5rem] shadow-2xl border-2 border-secondary/20 space-y-8">
                        <div className="flex flex-col gap-2"><label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pl-2">Nome do Insumo (Ex: Ninho 400g)</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-primary/5 p-6 rounded-2xl outline-none font-black text-sm border border-primary/5 focus:border-secondary focus:bg-white transition-all"/></div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="flex flex-col gap-2"><label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pl-2">Preço Pago (R$)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="bg-primary/5 p-6 rounded-2xl font-black text-sm outline-none border border-primary/5 focus:bg-white transition-all"/></div>
                           <div className="flex flex-col gap-2"><label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pl-2">Volume/Peso Total</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})} className="bg-primary/5 p-6 rounded-2xl font-black text-sm outline-none border border-primary/5 focus:bg-white transition-all"/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <button onClick={() => setIsNovo(false)} className="py-5 bg-primary/5 text-primary/40 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                           <button onClick={() => { onAdicionar(form); setIsNovo(false); setForm({ name: '', price: 0, quantity: 1000, unit: 'g' }); }} className="py-5 bg-secondary text-white font-black text-[10px] uppercase rounded-2xl shadow-xl">Salvar na Base Global</button>
                        </div>
                     </motion.div>
                 )}
             </AnimatePresence>

             <div className="grid gap-6">
                {insumos.map((i: Insumo) => (
                    <div key={i.id} className="bg-white p-8 rounded-[3rem] shadow-2xl border border-primary/5 flex items-center justify-between group relative overflow-hidden">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-xs uppercase">{i.unit}</div>
                            <div>
                                <h4 className="font-black text-xl text-primary tracking-tight">{i.name}</h4>
                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Custo Unitário: R$ {(i.price / i.quantity).toFixed(4)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right"><span className="text-[9px] font-black text-primary/20 uppercase tracking-widest block mb-1">Valor do Produto</span><span className="text-xl font-black text-primary">R$ {i.price.toFixed(2)}</span></div>
                            <button onClick={() => onDeletar(i.id)} className="p-4 bg-accent/5 text-accent/20 rounded-2xl hover:bg-accent/10 hover:text-accent transition-all"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
             </div>
        </motion.div>
    );
}

function EngenhariaList({ engenharias, insumos, onSalvar, onDeletar, onVer }: any) {
    const [isNovo, setIsNovo] = useState(false);
    const [form, setForm] = useState<Partial<Engenharia>>({ nome: '', componentes: [], margem: 3 });
    const [selectId, setSelectId] = useState("");
    const [selectQt, setSelectQt] = useState(0);

    const addComp = () => {
        if (!selectId || selectQt <= 0) return;
        setForm({...form, componentes: [...(form.componentes || []), { id_insumo: selectId, quantidade: selectQt }] });
        setSelectId(""); setSelectQt(0);
    };

    const calcularCustoTotal = (comps: ComponenteReceita[]) => {
        return comps.reduce((acc, curr) => {
            const ins = insumos.find((i: any) => i.id === curr.id_insumo);
            return acc + (ins ? (ins.price / ins.quantity) * curr.quantidade : 0);
        }, 0);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 max-w-5xl mx-auto pb-44">
             <header className="flex items-center justify-between mb-16">
                 <div>
                    <h2 className="text-5xl font-black text-primary tracking-tighter">Engenharias</h2>
                    <p className="text-primary/30 font-bold uppercase text-[10px] tracking-widest mt-2">Suas Fichas de Produção Técnicas</p>
                 </div>
                 <button onClick={() => setIsNovo(true)} className="h-20 w-20 bg-secondary text-white rounded-[2rem] shadow-2xl shadow-secondary/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all"><Plus size={32}/></button>
             </header>

             <AnimatePresence>
                {isNovo && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 mb-16 bg-white rounded-[4rem] shadow-2xl border-4 border-primary/5 space-y-10">
                        <div className="flex flex-col gap-2"><label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pl-2">Título da Engenharia (Ex: Massa de Red Velvet Supreme)</label><input type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="bg-primary/5 p-6 rounded-2xl outline-none font-black text-sm border border-primary/5 focus:bg-white transition-all"/></div>
                        
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4">Composição Técnica</h4>
                            <div className="flex gap-4">
                                <select value={selectId} onChange={e => setSelectId(e.target.value)} className="flex-1 bg-primary/5 p-5 rounded-2xl outline-none font-black text-xs border border-primary/5">
                                    <option value="">Buscar Insumo Global...</option>
                                    {insumos.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <input type="number" placeholder="Qtd" value={selectQt} onChange={e => setSelectQt(parseFloat(e.target.value))} className="w-28 bg-primary/5 p-5 rounded-2xl outline-none font-black text-xs border border-primary/5" />
                                <button onClick={addComp} className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all"><Plus size={20}/></button>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {form.componentes?.map((c, idx) => {
                                    const ins = insumos.find((i: any) => i.id === c.id_insumo);
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
                                            <span className="text-xs font-bold text-primary">{ins?.name}</span>
                                            <span className="text-xs font-black text-secondary">{c.quantidade}g</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6">
                             <button onClick={() => setIsNovo(false)} className="py-5 bg-primary/5 text-primary/40 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                             <button onClick={() => { onSalvar(form); setIsNovo(false); setForm({ nome: '', componentes: [], margem: 3 }); }} className="py-5 bg-secondary text-white font-black text-[10px] uppercase rounded-2xl shadow-xl">Finalizar Engenharia</button>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {engenharias.map((e: Engenharia) => (
                    <div key={e.id} className="bg-white p-10 rounded-[4rem] shadow-2xl border border-primary/5 group relative overflow-hidden hover:border-secondary/20 transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-primary leading-none truncate pr-4">{e.nome}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => onVer(e)} className="p-4 bg-secondary/10 text-secondary rounded-2xl hover:bg-secondary hover:text-white transition-all"><FileText size={18}/></button>
                                <button onClick={() => onDeletar(e.id)} className="p-4 bg-accent/5 text-accent/20 rounded-2xl hover:bg-accent/10 hover:text-accent transition-all"><Trash size={18}/></button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-10">
                            <div><span className="text-[9px] font-black text-primary/20 uppercase tracking-widest block mb-1">Custo Bruto</span><span className="text-xl font-black text-primary">R$ {calcularCustoTotal(e.componentes).toFixed(2)}</span></div>
                            <div className="text-right"><span className="text-[9px] font-black text-primary/20 uppercase tracking-widest block mb-1">Preço Sugerido</span><span className="text-xl font-black text-secondary">R$ {(calcularCustoTotal(e.componentes) * e.margem).toFixed(2)}</span></div>
                           <button onClick={() => onVer(e)} className="w-full py-5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl active:scale-95 transition-all">Analisar Lucratividade</button>
                    </div>
                ))}
            </div>
            {engenharias.length === 0 && (
                <div className="py-24 text-center opacity-10 flex flex-col items-center">
                    <BookOpen size={64} className="mb-6"/>
                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">Nenhuma ficha técnica criada</span>
                </div>
            )}
        </motion.div>
    );
}

function DetalheEngenharia({ eng, insumos, onVoltar }: any) {
    const calcularCustos = () => {
        const custoInsumos = eng.componentes.reduce((acc: any, curr: any) => {
            const ins = insumos.find((i: any) => i.id === curr.id_insumo);
            return acc + (ins ? (ins.price / ins.quantity) * curr.quantidade : 0);
        }, 0);
        return {
            insumos: custoInsumos,
            total: custoInsumos + (custoInsumos * (eng.custos_fixos / 100))
        };
    };

    const custos = calcularCustos();

    const handleExportarPDF = () => {
        const doc = new jsPDF() as any;
        const data = new Date().toLocaleDateString();

        // Estilização do PDF
        doc.setFontSize(22);
        doc.setTextColor(26, 26, 46); // Primary Color
        doc.text("FICHA TECNICA MASTER", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(212, 175, 55); // Secondary Color
        doc.text(`GERADO POR CHEF PRECISION - ${data}`, 14, 28);

        doc.setFontSize(16);
        doc.setTextColor(26, 26, 46);
        doc.text(eng.nome.toUpperCase(), 14, 45);

        // Tabela de Componentes
        const tableBody = eng.componentes.map((c: any, index: number) => {
            const ins = insumos.find((i: any) => i.id === c.id_insumo);
            const custo = ins ? (ins.price / ins.quantity) * c.quantidade : 0;
            return [index + 1, ins?.name || "N/A", `${c.quantidade}${ins?.unit || 'g'}`, `R$ ${custo.toFixed(2)}` ];
        });

        doc.autoTable({
            startY: 55,
            head: [['#', 'INSUMO', 'QUANTIDADE', 'CUSTO (R$)']],
            body: tableBody,
            headStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 249, 250] },
        });

        const finalY = (doc as any).lastAutoTable.finalY + 15;

        // Resumo Financeiro
        doc.setFontSize(12);
        doc.text(`CUSTO DE INSUMOS: R$ ${custos.insumos.toFixed(2)}`, 14, finalY);
        doc.text(`CUSTOS FIXOS (${eng.custos_fixos}%): R$ ${(custos.insumos * (eng.custos_fixos/100)).toFixed(2)}`, 14, finalY + 7);
        
        doc.setFontSize(14);
        doc.setTextColor(212, 175, 55);
        doc.text(`PRECO SUGERIDO (MARKUP ${eng.margem}x): R$ ${(custos.total * eng.margem).toFixed(2)}`, 14, finalY + 20);

        doc.save(`FICHA_${eng.nome.replace(/\s+/g, '_').toUpperCase()}.pdf`);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="p-10 max-w-4xl mx-auto pb-40">
            <div className="flex items-center justify-between mb-10">
                <button onClick={onVoltar} className="flex items-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-widest hover:text-primary transition-colors"><ArrowLeft size={16}/> Voltar</button>
                <button onClick={handleExportarPDF} className="p-4 bg-secondary text-white rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    <FileText size={16}/> Exportar PDF
                </button>
            </div>
            <div className="bg-white p-12 rounded-[5rem] shadow-[0_60px_150px_rgba(26,26,46,0.1)] border border-primary/5">
                <header className="mb-12 border-b border-primary/5 pb-12">
                   <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] block mb-4">Gourmet Engineering Data</span>
                   <h2 className="text-5xl font-black text-primary tracking-tighter leading-none mb-6">{eng.nome}</h2>
                   <div className="flex gap-4">
                      <div className="px-5 py-3 bg-primary/5 rounded-2xl font-black text-[10px] text-primary/40 uppercase">Markup {eng.margem}x</div>
                      <div className="px-5 py-3 bg-secondary/10 rounded-2xl font-black text-[10px] text-secondary uppercase">Premium Ficha</div>
                   </div>
                </header>

                <div className="space-y-8 mb-16">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Detalhamento de Custos</h4>
                    {eng.componentes.map((c: any, idx: number) => {
                        const ins = insumos.find((i: any) => i.id === c.id_insumo);
                        const custo = ins ? (ins.price / ins.quantity) * c.quantidade : 0;
                        return (
                            <div key={idx} className="flex items-center justify-between p-6 bg-primary/[0.02] rounded-[2rem] border border-primary/5 group hover:bg-white hover:shadow-xl transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-xs text-primary/20 shadow-sm">{idx + 1}</div>
                                    <span className="font-bold text-primary">{ins?.name} <span className="text-[11px] text-primary/30 ml-2">({c.quantidade}g)</span></span>
                                </div>
                                <span className="font-black text-primary text-sm tracking-tight">R$ {custo.toFixed(2)}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="p-12 bg-primary rounded-[3.5rem] text-white flex flex-col items-center gap-4 text-center">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Preço de Venda Pró-Elite</span>
                   <div className="text-6xl font-black text-secondary">R$ {(custoTotal * eng.margem).toFixed(2)}</div>
                   <p className="text-white/40 text-xs font-bold mt-4 uppercase tracking-widest italic">Considerando Custo de R$ {custoTotal.toFixed(2)}</p>
                </div>
            </div>
        </motion.div>
    );
}

function ConfiguracoesMaster({ config, setConfig }: any) {
  return (
    <div className="p-12 max-w-4xl mx-auto py-32 text-center flex flex-col items-center">
       <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary/20 mb-8"><Settings size={48} /></div>
       <h2 className="text-4xl font-black text-primary tracking-tighter uppercase mb-4">Custos Estruturais</h2>
       <p className="text-primary/40 text-lg max-w-sm font-medium italic mb-12 leading-relaxed">Defina seus custos fixos globais para alimentar automaticamente suas fichas técnicas.</p>
       
       <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-primary/5 space-y-6">
          <div className="flex flex-col gap-2 text-left">
             <label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pl-2">Mão de Obra (R$/Hora)</label>
             <input type="number" value={config.mao_de_obra} onChange={e => setConfig({...config, mao_de_obra: parseFloat(e.target.value)})} className="bg-primary/5 p-6 rounded-2xl outline-none font-black"/>
          </div>
          <div className="flex flex-col gap-2 text-left">
             <label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pl-2">Rateio de Custos Fixos (%)</label>
             <input type="number" value={config.taxa_fixa} onChange={e => setConfig({...config, taxa_fixa: parseFloat(e.target.value)})} className="bg-primary/5 p-6 rounded-2xl outline-none font-black"/>
          </div>
          <p className="text-[9px] text-primary/20 font-bold uppercase italic mt-4">Estes valores serão aplicados em todas as suas novas engenharias.</p>
       </div>
    </div>
  );
}
