"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, Plus, Clock, ArrowLeft, ChefHat, Trash2, Save, Package, Flame, Target, CheckCircle2, AlertCircle, Settings, Scale, Edit2, Printer, Minus, ShoppingBag, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// --- Tipos Essenciais ---
interface Insumo {
  id: string;
  nome: string;
  preco_embalagem: number;
  tamanho_embalagem: number;
  unidade_medida?: string;
  categoria?: string;
}

interface ItemUsado {
  insumoId: string;
  quantidadeUsada: number;
}

interface Receita {
  id: string;
  nome: string;
  rendimento: number;
  itens: ItemUsado[];
  embalagens: ItemUsado[];
  minutos_preparo_ativo: number;
  minutos_forno: number;
  margem_lucro_desejada: number; 
  taxa_venda: number;
  margem_perda: number;
  preco_sugerido?: number;
  lucro_liquido?: number;
}

export default function AppCalculadora() {
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitasSalvas, setReceitasSalvas] = useState<Receita[]>([]);
  const [viewingReceita, setViewingReceita] = useState<Receita | null>(null);
  const [escala, setEscala] = useState(1);
  
  const [supabase] = useState(() => createClient());

  const [session, setSession] = useState<any>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Configurações Globais
  const [horasTrabalhoMensal, setHorasTrabalhoMensal] = useState(160);
  const [salarioDesejado, setSalarioDesejado] = useState(2500);
  const [custosFixos, setCustosFixos] = useState(500);
  const [custoFixoMensal, setCustoFixoMensal] = useState(120);

  const [showConfig, setShowConfig] = useState(false);

  // Derivados
  const valorMinutoTrabalho = salarioDesejado / (horasTrabalhoMensal * 60);
  const custoFixoPorMinutoForno = custoFixoMensal / (horasTrabalhoMensal * 60);
  const custoFixoPorMinutoTrabalho = custosFixos / (horasTrabalhoMensal * 60);

  // Estado do Construtor (Builder)
  const [novaReceita, setNovaReceita] = useState<Partial<Receita>>({
    nome: "",
    rendimento: 1,
    itens: [],
    embalagens: [],
    minutos_preparo_ativo: 0,
    minutos_forno: 0,
    margem_lucro_desejada: 30,
    taxa_venda: 0,
    margem_perda: 10
  });

  const [tempInsumo, setTempInsumo] = useState({ nome: "", preco: "", tamanho: "", unidade_medida: "g", categoria: "ingrediente" });
  const [tempQuantidadeUsada, setTempQuantidadeUsada] = useState("");
  const [selectedInsumoId, setSelectedInsumoId] = useState("");
  
  const [tempEmbalagemQtd, setTempEmbalagemQtd] = useState("");
  const [selectedEmbalagemId, setSelectedEmbalagemId] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [showInsumoForm, setShowInsumoForm] = useState(false);
  const [showEmbalagemForm, setShowEmbalagemForm] = useState(false);

  // Estado de Edição de Insumo (Despensa)
  const [editInsumo, setEditInsumo] = useState<Insumo | null>(null);
  const [isUpdatingInsumo, setIsUpdatingInsumo] = useState(false);

  // Estados do Conversor
  const [showConverter, setShowConverter] = useState(false);
  const [convTipo, setConvTipo] = useState('liquido');
  const [convMedida, setConvMedida] = useState('xicara');
  const [convQtd, setConvQtd] = useState('');

  const CONVERSOES: Record<string, any> = {
    'liquido': { nome: 'Líquidos (Leite/Óleo/Água)', xicara: 240, colher_sopa: 15, colher_cha: 5 },
    'farinha': { nome: 'Farinha de Trigo', xicara: 120, colher_sopa: 8, colher_cha: 3 },
    'acucar': { nome: 'Açúcar Refinado', xicara: 160, colher_sopa: 10, colher_cha: 4 },
    'manteiga': { nome: 'Manteiga/Margarina', xicara: 200, colher_sopa: 12, colher_cha: 4 },
    'cacau': { nome: 'Cacau em Pó', xicara: 90, colher_sopa: 6, colher_cha: 2 },
    'quilo': { nome: 'Quilos (Kg) para Gramas (g)', kg: 1000 },
    'litro': { nome: 'Litros (L) para Mililitros (ml)', litro: 1000 }
  };

  const calcularConversao = () => {
    const qtd = parseFloat(convQtd) || 0;
    if (qtd === 0) return 0;
    const fator = CONVERSOES[convTipo][convMedida];
    return Math.round(qtd * fator);
  };

  useEffect(() => {
    const savedSalario = localStorage.getItem('salarioDesejado');
    if (savedSalario) setSalarioDesejado(Number(savedSalario));
    const savedBotijao = localStorage.getItem('custoFixoMensal');
    if (savedBotijao) setCustoFixoMensal(Number(savedBotijao));
    const savedHoras = localStorage.getItem('horasTrabalhoMensal');
    if (savedHoras) setHorasTrabalhoMensal(Number(savedHoras));
    const savedFixos = localStorage.getItem('custosFixos');
    if (savedFixos) setCustosFixos(Number(savedFixos));

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (session) {
      carregarDados();
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('salarioDesejado', salarioDesejado.toString());
    localStorage.setItem('custoFixoMensal', custoFixoMensal.toString());
    localStorage.setItem('horasTrabalhoMensal', horasTrabalhoMensal.toString());
    localStorage.setItem('custosFixos', custosFixos.toString());
  }, [salarioDesejado, custoFixoMensal, horasTrabalhoMensal, custosFixos]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erro ao entrar: " + error.message);
    setAuthLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Erro: " + error.message);
    else alert("Conta criada! Você já pode fazer o login.");
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");
    setAuthLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Erro ao atualizar senha: " + error.message);
    else {
      alert("Senha atualizada com sucesso!");
      setNewPassword("");
    }
    setAuthLoading(false);
  };

  const carregarDados = async () => {
    const { data: dataInsumos } = await supabase.from('insumos').select('*').order('created_at', { ascending: false });
    if (dataInsumos) setInsumos(dataInsumos);

    const { data: dataReceitas } = await supabase.from('receitas').select('*').order('created_at', { ascending: false });
    if (dataReceitas) setReceitasSalvas(dataReceitas);
  };

  const salvarNovoInsumo = async () => {
    if (!tempInsumo.nome || !tempInsumo.preco || !tempInsumo.tamanho) return null;
    
    setIsSaving(true);
    const novo = {
      nome: tempInsumo.nome,
      preco_embalagem: parseFloat(tempInsumo.preco),
      tamanho_embalagem: parseFloat(tempInsumo.tamanho),
      unidade_medida: tempInsumo.unidade_medida || "g",
      categoria: tempInsumo.categoria || "ingrediente"
    };
    
    const { data, error } = await supabase.from('insumos').insert([novo]).select().single();
    setIsSaving(false);
    
    if (error) {
      alert("Erro ao salvar ingrediente.");
      return null;
    }

    setInsumos(prev => [data, ...prev]);
    setTempInsumo({ nome: "", preco: "", tamanho: "", unidade_medida: "g", categoria: "ingrediente" });
    setShowInsumoForm(false);
    setShowEmbalagemForm(false);
    if(data) {
       if (data.categoria === 'embalagem') setSelectedEmbalagemId(data.id);
       else setSelectedInsumoId(data.id);
    }
    return data as Insumo;
  };

  const atualizarInsumo = async () => {
    if (!editInsumo || !editInsumo.nome) return;
    setIsUpdatingInsumo(true);
    
    const { data, error } = await supabase
      .from('insumos')
      .update({
        nome: editInsumo.nome,
        preco_embalagem: Number(editInsumo.preco_embalagem),
        tamanho_embalagem: Number(editInsumo.tamanho_embalagem),
        unidade_medida: editInsumo.unidade_medida,
        categoria: editInsumo.categoria || 'ingrediente'
      })
      .eq('id', editInsumo.id)
      .select().single();
      
    setIsUpdatingInsumo(false);
    
    if (error) {
      alert("Erro ao atualizar ingrediente: " + error.message);
    } else if (data) {
      setInsumos(prev => prev.map(i => i.id === data.id ? data : i));
      setEditInsumo(null);
    }
  };

  const calcularResultados = () => {
    const custoIngredientesPuros = (novaReceita.itens || []).reduce((total, item) => {
      const insumoInfo = insumos.find(i => i.id === item.insumoId);
      if (!insumoInfo) return total;
      const custoPorGrama = insumoInfo.preco_embalagem / insumoInfo.tamanho_embalagem;
      return total + (custoPorGrama * item.quantidadeUsada);
    }, 0);

    const perdas = custoIngredientesPuros * ((novaReceita.margem_perda || 0) / 100);
    const custoIngredientes = custoIngredientesPuros + perdas;

    const custoEmbalagens = (novaReceita.embalagens || []).reduce((total, item) => {
      const insumoInfo = insumos.find(i => i.id === item.insumoId);
      if (!insumoInfo) return total;
      const custoPorGrama = insumoInfo.preco_embalagem / insumoInfo.tamanho_embalagem;
      return total + (custoPorGrama * item.quantidadeUsada);
    }, 0);

    const custoMaoDeObra = (novaReceita.minutos_preparo_ativo || 0) * valorMinutoTrabalho;
    const custoForno = (novaReceita.minutos_forno || 0) * custoFixoPorMinutoForno;
    const custoRateioFixo = (novaReceita.minutos_preparo_ativo || 0) * custoFixoPorMinutoTrabalho;
    
    const custoTotalReceita = custoIngredientes + custoEmbalagens + custoMaoDeObra + custoForno + custoRateioFixo;
    
    const rendimento = novaReceita.rendimento || 1;
    const custoUnitario = custoTotalReceita / rendimento;
    
    const margem = (novaReceita.margem_lucro_desejada || 0) / 100;
    const taxaVenda = (novaReceita.taxa_venda || 0) / 100;
    
    const denominador = 1 - margem - taxaVenda;
    const precoSugeridoUnitario = denominador > 0 ? (custoUnitario / denominador) : 0;
    
    const descontoTaxa = precoSugeridoUnitario * taxaVenda;
    const lucroLiquidoUnitario = precoSugeridoUnitario - custoUnitario - descontoTaxa;

    const precoSugeridoTotal = precoSugeridoUnitario * rendimento;
    const lucroLiquidoTotal = lucroLiquidoUnitario * rendimento;

    return { 
      custoIngredientesPuros, perdas, custoIngredientes, custoEmbalagens, custoMaoDeObra, custoForno, custoRateioFixo,
      custoTotalReceita, custoUnitario, 
      precoSugeridoUnitario, lucroLiquidoUnitario,
      precoSugeridoTotal, lucroLiquidoTotal, descontoTaxa
    };
  };

  const salvarReceitaNoBanco = async () => {
    if (!novaReceita.nome) return alert("Dê um nome para a receita antes de salvar.");
    const res = calcularResultados();
    const receitaParaSalvar = {
      nome: novaReceita.nome,
      rendimento: novaReceita.rendimento || 1,
      itens: novaReceita.itens,
      embalagens: novaReceita.embalagens || [],
      minutos_preparo_ativo: novaReceita.minutos_preparo_ativo,
      minutos_forno: novaReceita.minutos_forno,
      margem_lucro_desejada: novaReceita.margem_lucro_desejada,
      taxa_venda: novaReceita.taxa_venda || 0,
      margem_perda: novaReceita.margem_perda || 0,
      preco_sugerido: res.precoSugeridoTotal,
      lucro_liquido: res.lucroLiquidoTotal
    };

    setIsSaving(true);
    
    let data, error;
    if (novaReceita.id) {
      const result = await supabase.from('receitas').update(receitaParaSalvar).eq('id', novaReceita.id).select().single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase.from('receitas').insert([receitaParaSalvar]).select().single();
      data = result.data;
      error = result.error;
    }
    
    setIsSaving(false);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else if (data) {
      if (novaReceita.id) {
        setReceitasSalvas(prev => prev.map(r => r.id === data.id ? data : r));
      } else {
        setReceitasSalvas(prev => [data, ...prev]);
      }
      setView('dashboard');
    }
  };

  const adicionarItemAReceita = (insumoId: string, quantidade: number) => {
    setNovaReceita(prev => ({
      ...prev,
      itens: [...(prev.itens || []), { insumoId, quantidadeUsada: quantidade }]
    }));
  };

  const removerItemDaReceita = (index: number) => {
    setNovaReceita(prev => {
      const novos = [...(prev.itens || [])];
      novos.splice(index, 1);
      return { ...prev, itens: novos };
    });
  };

  const adicionarEmbalagemAReceita = (insumoId: string, quantidade: number) => {
    setNovaReceita(prev => ({
      ...prev,
      embalagens: [...(prev.embalagens || []), { insumoId, quantidadeUsada: quantidade }]
    }));
  };

  const removerEmbalagemDaReceita = (index: number) => {
    setNovaReceita(prev => {
      const novos = [...(prev.embalagens || [])];
      novos.splice(index, 1);
      return { ...prev, embalagens: novos };
    });
  };

  const iniciarNovaPrecificacao = () => {
    setNovaReceita({ nome: "", rendimento: 1, itens: [], embalagens: [], minutos_preparo_ativo: 0, minutos_forno: 0, margem_lucro_desejada: 30, taxa_venda: 0, margem_perda: 10 });
    setView('builder');
  };

  const excluirReceita = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir?")) return;
    
    const { error } = await supabase.from('receitas').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      setReceitasSalvas(prev => prev.filter(r => r.id !== id));
    }
  };

  const res = view === 'builder' ? calcularResultados() : null;

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-md bg-neutral-900 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/20 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex flex-col items-center justify-center mb-10 z-10 relative">
            <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-4 rounded-2xl shadow-lg shadow-orange-500/20 mb-4">
              <ChefHat className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-center">Precifica Chef</h1>
            <p className="text-neutral-400 text-sm mt-2 text-center">Faça login para acessar suas fichas técnicas.</p>
          </div>

          <form onSubmit={authView === 'login' ? handleLogin : handleRegister} className="space-y-4 z-10 relative">
            <div>
              <label className="text-xs text-neutral-400 block mb-1 uppercase tracking-wider font-bold">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500 transition-colors" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1 uppercase tracking-wider font-bold">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500 transition-colors" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-4 rounded-xl mt-6 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
              {authLoading ? 'Carregando...' : authView === 'login' ? 'Entrar na Plataforma' : 'Criar minha Conta'}
            </button>
          </form>

          <div className="mt-6 text-center z-10 relative border-t border-white/5 pt-6">
            <button type="button" onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')} className="text-sm text-neutral-400 hover:text-amber-500 transition-colors">
              {authView === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 font-sans selection:bg-amber-500 selection:text-black">
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50 px-6 py-4 flex justify-between items-center shadow-2xl shadow-black print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <ChefHat className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Precifica Chef</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowConfig(true)} className="text-neutral-400 hover:text-amber-500 transition-colors p-2" title="Configurações">
            <Settings size={20} />
          </button>
          {view === 'builder' && (
            <button onClick={() => setView('dashboard')} className="text-sm font-medium text-neutral-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft size={16} /> Voltar ao Painel
            </button>
          )}
        </div>
      </header>

      {/* MODAL DO CONVERSOR */}
      <AnimatePresence>
        {showConverter && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Scale className="text-amber-500"/> Conversor</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Tipo de Ingrediente</label>
                  <select value={convTipo} onChange={e => { setConvTipo(e.target.value); setConvMedida(e.target.value === 'quilo' ? 'kg' : e.target.value === 'litro' ? 'litro' : 'xicara'); }} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500">
                    {Object.entries(CONVERSOES).map(([key, obj]) => (
                      <option key={key} value={key}>{obj.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-neutral-400 block mb-1">Medida Base</label>
                    <select value={convMedida} onChange={e => setConvMedida(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500">
                      {convTipo === 'quilo' ? <option value="kg">Quilogramas (Kg)</option> : convTipo === 'litro' ? <option value="litro">Litros (L)</option> : (
                        <>
                          <option value="xicara">Xícara</option>
                          <option value="colher_sopa">Colher Sopa</option>
                          <option value="colher_cha">Colher Chá</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-neutral-400 block mb-1">Qtd.</label>
                    <input type="number" step="0.5" value={convQtd} onChange={e => setConvQtd(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-end border-t border-white/5">
                  <span className="text-sm text-neutral-400">Resultado:</span>
                  <span className="text-2xl font-black text-amber-500">{calcularConversao()} {convTipo === 'litro' ? 'ml' : 'g'}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowConverter(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors">Cancelar</button>
                <button onClick={() => {
                  const res = calcularConversao();
                  if (res > 0) setTempQuantidadeUsada(res.toString());
                  setShowConverter(false);
                }} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-bold">Usar Valor</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CONFIGURAÇÕES */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-amber-500"/> Configurações de Custos</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Sua Meta Salarial / Pró-labore (R$ por mês)</label>
                  <input type="number" value={salarioDesejado} onChange={e => setSalarioDesejado(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Preço do Botijão de Gás cheio (R$)</label>
                  <input type="number" value={custoFixoMensal} onChange={e => setCustoFixoMensal(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Custos Fixos do Negócio (Aluguel, Luz, MEI, Água) (R$)</label>
                  <input type="number" value={custosFixos} onChange={e => setCustosFixos(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Horas Trabalhadas no Mês</label>
                  <input type="number" value={horasTrabalhoMensal} onChange={e => setHorasTrabalhoMensal(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                  <p className="text-[10px] text-neutral-500 mt-1">Ex: 8h x 20 dias = 160h</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <div className="bg-black/30 border border-white/5 p-4 rounded-2xl mb-2">
                  <label className="text-xs text-neutral-400 block mb-2 font-bold uppercase tracking-wider">Alterar Senha (Opcional)</label>
                  <div className="flex gap-2">
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha (mín 6 caracteres)" className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" />
                    <button onClick={handleUpdatePassword} disabled={authLoading || newPassword.length < 6} className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 rounded-xl transition-colors disabled:opacity-50">Atualizar</button>
                  </div>
                </div>

                <button onClick={() => setShowConfig(false)} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl transition-colors font-bold">Concluído</button>
                <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl transition-colors font-medium border border-red-500/20">Sair da Conta</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE VISUALIZAÇÃO DE RECEITA (COM IMPRESSÃO E ESCALA) */}
      <AnimatePresence>
        {viewingReceita && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:bg-white print:p-0 print:absolute print:inset-0 print:block">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:border-none print:shadow-none print:w-full print:max-h-full print:bg-white print:text-black">
              
              {/* CABEÇALHO DO MODAL - NÃO IMPRIME */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 print:hidden">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ChefHat className="text-amber-500"/> Ficha Técnica: {viewingReceita.nome}
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                     setNovaReceita(viewingReceita);
                     setView('builder');
                     setViewingReceita(null);
                  }} className="bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black px-4 py-2 rounded-xl transition-colors font-bold flex items-center gap-2">
                    <Edit2 size={16}/> Editar Ficha
                  </button>
                  <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2">
                    <Printer size={16}/> Imprimir
                  </button>
                  <button onClick={() => setViewingReceita(null)} className="text-neutral-500 hover:text-white p-2">
                    <X size={24}/>
                  </button>
                </div>
              </div>

              {/* CONTEÚDO SCROLLÁVEL */}
              <div className="p-6 overflow-y-auto print:overflow-visible print:p-4">
                
                {/* CONTROLE DE ESCALA - NÃO IMPRIME */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-8 flex items-center gap-4 print:hidden">
                  <div className="bg-amber-500 text-black p-3 rounded-xl"><Calculator size={24}/></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-500 uppercase tracking-wider">Modo Festa (Calculadora de Escala)</p>
                    <p className="text-xs text-neutral-400">Quer fazer mais porções? Aumente o fator multiplicador abaixo para recalcular todas as compras necessárias.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-black/50 p-2 rounded-xl border border-white/10">
                    <button onClick={() => setEscala(e => Math.max(1, e - 1))} className="p-2 hover:bg-white/10 rounded-lg"><Minus size={16}/></button>
                    <span className="font-black text-xl w-12 text-center text-white">x{escala}</span>
                    <button onClick={() => setEscala(e => e + 1)} className="p-2 hover:bg-white/10 rounded-lg"><Plus size={16}/></button>
                  </div>
                </div>

                {/* FICHA PARA IMPRESSÃO */}
                <div className="print:text-black space-y-8">
                  <div className="text-center border-b border-neutral-800 pb-6 print:border-neutral-300">
                    <h1 className="text-3xl font-black text-white print:text-black mb-2">{viewingReceita.nome}</h1>
                    <p className="text-neutral-400 print:text-neutral-600 text-lg">
                      Rendimento original: <span className="font-bold text-white print:text-black">{viewingReceita.rendimento} porções</span>
                      {escala > 1 && <span className="text-amber-500 font-bold ml-2">➡️ Rendimento Calculado: {(viewingReceita.rendimento || 1) * escala} porções</span>}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* INGREDIENTES */}
                    <div>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white print:text-black"><ShoppingBag className="text-orange-500 print:text-black"/> Ingredientes Necessários</h3>
                      <ul className="space-y-3">
                        {viewingReceita.itens?.map((item, idx) => {
                          const insumo = insumos.find(i => i.id === item.insumoId);
                          return (
                            <li key={idx} className="flex justify-between items-end border-b border-neutral-800 print:border-neutral-200 pb-2">
                              <span className="text-neutral-300 print:text-neutral-800">{insumo?.nome}</span>
                              <span className="font-bold text-white print:text-black">{(item.quantidadeUsada * escala).toLocaleString('pt-BR')} {insumo?.unidade_medida || 'g'}</span>
                            </li>
                          );
                        })}
                        {(!viewingReceita.itens || viewingReceita.itens.length === 0) && (
                          <li className="text-neutral-500">Nenhum ingrediente.</li>
                        )}
                      </ul>
                    </div>

                    {/* EMBALAGENS */}
                    <div>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white print:text-black"><Package className="text-pink-500 print:text-black"/> Embalagens Necessárias</h3>
                      <ul className="space-y-3">
                        {viewingReceita.embalagens?.map((item, idx) => {
                          const insumo = insumos.find(i => i.id === item.insumoId);
                          return (
                            <li key={idx} className="flex justify-between items-end border-b border-neutral-800 print:border-neutral-200 pb-2">
                              <span className="text-neutral-300 print:text-neutral-800">{insumo?.nome}</span>
                              <span className="font-bold text-white print:text-black">{(item.quantidadeUsada * escala).toLocaleString('pt-BR')} {insumo?.unidade_medida || 'un'}</span>
                            </li>
                          );
                        })}
                        {(!viewingReceita.embalagens || viewingReceita.embalagens.length === 0) && (
                          <li className="text-neutral-500">Nenhuma embalagem.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* CUSTOS GERAIS PARA IMPRESSÃO */}
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl print:bg-neutral-100 print:border-neutral-300 mt-8">
                    <h3 className="font-bold text-lg mb-4 text-white print:text-black">Resumo Financeiro (Para 1 Lote Original)</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-neutral-500 print:text-neutral-600 mb-1">Custo Total de Produção</p>
                        <p className="text-xl font-bold text-red-400 print:text-red-700">R$ {((viewingReceita.preco_sugerido || 0) - (viewingReceita.lucro_liquido || 0)).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 print:text-neutral-600 mb-1">Preço Sugerido (Total)</p>
                        <p className="text-xl font-bold text-amber-500 print:text-black">R$ {viewingReceita.preco_sugerido?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 print:text-neutral-600 mb-1">Lucro Líquido Limpo</p>
                        <p className="text-xl font-bold text-green-400 print:text-green-700">R$ {viewingReceita.lucro_liquido?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="pt-24 pb-10 px-6 max-w-7xl mx-auto min-h-screen print:hidden">
        <AnimatePresence mode="wait">
          
          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 max-w-3xl mx-auto mt-10">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">Precificação exata.<br/><span className="text-amber-500">Lucro garantido.</span></h2>
                <p className="text-neutral-400 text-lg">Gerencie seus custos e saiba exatamente quanto cobrar pelas suas receitas.</p>
              </div>

              <button onClick={iniciarNovaPrecificacao} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-95 transition-all">
                <Plus size={24} /> Criar Nova Ficha Técnica
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Lista de Fichas */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                  <h3 className="font-bold mb-6 flex items-center gap-2 text-neutral-200">
                    <Save size={20} className="text-amber-500"/> Fichas Técnicas
                  </h3>
                  {receitasSalvas.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-8">Nenhuma receita calculada ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {receitasSalvas.map(r => (
                        <div key={r.id} onClick={() => { setViewingReceita(r); setEscala(1); }} className="group cursor-pointer relative overflow-hidden flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all hover:bg-white/5">
                          <div className="z-10">
                            <p className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors">{r.nome}</p>
                            <p className="text-xs text-neutral-400 mt-1">Lote R$ {r.preco_sugerido?.toFixed(2)}</p>
                          </div>
                          <div className="z-10 flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded-md inline-block border border-green-400/20 mb-1 block w-fit ml-auto">
                                + R$ {r.lucro_liquido?.toFixed(2)}
                              </p>
                              <span className="text-[10px] text-neutral-500 group-hover:text-amber-500 transition-colors block">Clique para visualizar</span>
                            </div>
                            <button onClick={(e) => excluirReceita(r.id, e)} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir ficha">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Insumos */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col max-h-[500px]">
                  <h3 className="font-bold mb-6 flex items-center gap-2 text-neutral-200">
                    <Package size={20} className="text-orange-500"/> Despensa
                  </h3>
                  {insumos.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-8">Sua despensa está vazia.</p>
                  ) : (
                    <div className="space-y-3 overflow-y-auto pr-2">
                      {insumos.map(i => (
                        <div key={i.id} onClick={() => setEditInsumo(i)} className="group cursor-pointer flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5 hover:border-orange-500/30 hover:bg-white/5 transition-all">
                          <span className="text-sm font-medium text-neutral-300 group-hover:text-orange-400 transition-colors">
                            {i.nome} <span className="text-[10px] text-neutral-500 bg-white/5 px-1 ml-1 rounded">{i.categoria === 'embalagem' ? '📦' : '🥣'}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-500 bg-white/5 px-2 py-1 rounded group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-colors">
                              R$ {i.preco_embalagem.toFixed(2)} / {i.tamanho_embalagem}{i.unidade_medida || 'g'}
                            </span>
                            <Edit2 size={14} className="text-neutral-600 group-hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-all"/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* BUILDER VIEW (SPLIT SCREEN) */}
          {view === 'builder' && res && (
            <motion.div key="builder" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* ESQUERDA: Formulário Dedutivo */}
              <div className="w-full lg:w-2/3 space-y-8">
                
                {/* Cabeçalho da Receita */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-6 flex items-center gap-2"><ChefHat size={16}/> O Produto</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs text-neutral-400 mb-2 block font-medium">O que você está fazendo?</label>
                      <input type="text" placeholder="Ex: Cento de Brigadeiro Gourmet" value={novaReceita.nome || ""} onChange={e => setNovaReceita({...novaReceita, nome: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-colors placeholder:text-neutral-600 font-medium" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-2 block font-medium" title="Quantos itens você vai conseguir vender com essa receita inteira?">
                        Rende quantas porções para venda?
                      </label>
                      <input type="number" min="1" placeholder="Ex: 50 doces, 1 bolo, 10 fatias" value={novaReceita.rendimento || ""} onChange={e => setNovaReceita({...novaReceita, rendimento: parseInt(e.target.value) || 1})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-colors font-bold text-center text-sm" />
                    </div>
                  </div>
                </section>

                {/* Ingredientes */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2"><Package size={16}/> Ingredientes</h2>
                    <button onClick={() => setShowInsumoForm(!showInsumoForm)} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                      <Plus size={14}/> Cadastrar Insumo
                    </button>
                  </div>

                  {/* Formulário Rápido de Insumo */}
                  <AnimatePresence>
                    {showInsumoForm && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
                          <input type="text" placeholder="Nome (Ex: Leite Moça)" value={tempInsumo.nome} onChange={e => setTempInsumo({...tempInsumo, nome: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" />
                          <div className="flex gap-3">
                            <input type="number" placeholder="Preço Pago (R$)" value={tempInsumo.preco} onChange={e => setTempInsumo({...tempInsumo, preco: e.target.value})} className="w-28 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" />
                            <input type="number" placeholder="Tamanho" value={tempInsumo.tamanho} onChange={e => setTempInsumo({...tempInsumo, tamanho: e.target.value})} className="w-24 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" />
                            <select value={tempInsumo.unidade_medida} onChange={e => setTempInsumo({...tempInsumo, unidade_medida: e.target.value})} className="w-20 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500">
                              <option value="g">g</option>
                              <option value="ml">ml</option>
                              <option value="un">un</option>
                            </select>
                            <button onClick={salvarNovoInsumo} disabled={isSaving} className="bg-amber-500 text-black font-bold px-4 rounded-xl hover:bg-amber-400 transition-colors whitespace-nowrap disabled:opacity-50">
                              Salvar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Adicionar Insumo Existente */}
                  <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                      <select value={selectedInsumoId} onChange={(e) => setSelectedInsumoId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-neutral-300 outline-none focus:border-amber-500 appearance-none">
                        <option value="" disabled>Selecione um ingrediente da despensa...</option>
                        {insumos.filter(i => i.categoria !== 'embalagem').map(i => <option key={i.id} value={i.id}>{i.nome} (R$ {i.preco_embalagem.toFixed(2)} / {i.tamanho_embalagem}{i.unidade_medida || 'g'})</option>)}
                      </select>
                    </div>
                    
                    <div className="relative flex w-full md:w-auto">
                      <input type="number" placeholder="Qtd Usada" value={tempQuantidadeUsada} onChange={e => setTempQuantidadeUsada(e.target.value)} className="w-full md:w-32 bg-black/50 border border-white/10 rounded-xl rounded-r-none p-3 text-sm text-white outline-none focus:border-amber-500" />
                      <button onClick={() => setShowConverter(true)} title="Conversor de Medidas" className="bg-white/5 border-y border-r border-white/10 px-3 hover:bg-white/10 hover:text-amber-500 text-neutral-400 rounded-r-xl transition-colors">
                        <Scale size={16} />
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        if (selectedInsumoId && tempQuantidadeUsada) {
                          adicionarItemAReceita(selectedInsumoId, parseFloat(tempQuantidadeUsada));
                          setTempQuantidadeUsada("");
                          setSelectedInsumoId("");
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 rounded-xl transition-colors"
                    >
                      Incluir
                    </button>
                  </div>

                  {/* Tabela de Itens Usados */}
                  <div className="space-y-2">
                    {novaReceita.itens?.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-sm text-neutral-500">Nenhum ingrediente adicionado à ficha técnica.</p>
                      </div>
                    ) : (
                      novaReceita.itens?.map((item, idx) => {
                        const insumo = insumos.find(i => i.id === item.insumoId);
                        const custo = insumo ? (insumo.preco_embalagem / insumo.tamanho_embalagem) * item.quantidadeUsada : 0;
                        return (
                          <div key={idx} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{insumo?.nome || 'Carregando...'}</span>
                              <span className="text-xs text-neutral-500">{item.quantidadeUsada} {insumo?.unidade_medida || 'g'} {insumo?.unidade_medida === 'un' ? '' : 'usados(as)'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-neutral-300">R$ {custo.toFixed(2)}</span>
                              <div className="flex gap-1">
                                <button onClick={() => {
                                  setSelectedInsumoId(insumo?.id || "");
                                  setTempQuantidadeUsada(item.quantidadeUsada.toString());
                                  removerItemDaReceita(idx);
                                }} className="text-blue-400/50 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-400/10 transition-colors" title="Editar quantidade"><Edit2 size={16} /></button>
                                <button onClick={() => removerItemDaReceita(idx)} className="text-red-400/50 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors" title="Remover"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Embalagens */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2"><Package size={16}/> Embalagens</h2>
                    <button onClick={() => {
                      setTempInsumo({ nome: "", preco: "", tamanho: "", unidade_medida: "un", categoria: "embalagem" });
                      setShowEmbalagemForm(!showEmbalagemForm);
                    }} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                      <Plus size={14}/> Cadastrar Embalagem
                    </button>
                  </div>

                  {/* Formulário Rápido de Embalagem */}
                  <AnimatePresence>
                    {showEmbalagemForm && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                        <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
                          <input type="text" placeholder="Nome (Ex: Caixa Kraft)" value={tempInsumo.nome} onChange={e => setTempInsumo({...tempInsumo, nome: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-pink-500" />
                          <div className="flex gap-3">
                            <input type="number" placeholder="Preço Pago (R$)" value={tempInsumo.preco} onChange={e => setTempInsumo({...tempInsumo, preco: e.target.value})} className="w-28 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-pink-500" />
                            <input type="number" placeholder="Qtd. Pacote" value={tempInsumo.tamanho} onChange={e => setTempInsumo({...tempInsumo, tamanho: e.target.value})} className="w-28 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-pink-500" />
                            <button onClick={salvarNovoInsumo} disabled={isSaving} className="bg-pink-500 text-black font-bold px-4 rounded-xl hover:bg-pink-400 transition-colors whitespace-nowrap disabled:opacity-50">
                              Salvar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                      <select value={selectedEmbalagemId} onChange={(e) => setSelectedEmbalagemId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-neutral-300 outline-none focus:border-pink-500 appearance-none">
                        <option value="" disabled>Selecione uma embalagem da despensa...</option>
                        {insumos.filter(i => i.categoria === 'embalagem').map(i => <option key={i.id} value={i.id}>{i.nome} (R$ {i.preco_embalagem.toFixed(2)} / {i.tamanho_embalagem}{i.unidade_medida || 'un'})</option>)}
                      </select>
                    </div>
                    
                    <div className="relative flex w-full md:w-auto">
                      <input type="number" placeholder="Qtd Usada" value={tempEmbalagemQtd} onChange={e => setTempEmbalagemQtd(e.target.value)} className="w-full md:w-32 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-pink-500" />
                    </div>

                    <button 
                      onClick={() => {
                        if (selectedEmbalagemId && tempEmbalagemQtd) {
                          adicionarEmbalagemAReceita(selectedEmbalagemId, parseFloat(tempEmbalagemQtd));
                          setTempEmbalagemQtd("");
                          setSelectedEmbalagemId("");
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 rounded-xl transition-colors"
                    >
                      Incluir
                    </button>
                  </div>

                  {/* Tabela de Embalagens Usadas */}
                  <div className="space-y-2">
                    {novaReceita.embalagens?.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-sm text-neutral-500">Nenhuma embalagem adicionada.</p>
                      </div>
                    ) : (
                      novaReceita.embalagens?.map((item, idx) => {
                        const insumo = insumos.find(i => i.id === item.insumoId);
                        const custo = insumo ? (insumo.preco_embalagem / insumo.tamanho_embalagem) * item.quantidadeUsada : 0;
                        return (
                          <div key={idx} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{insumo?.nome || 'Carregando...'}</span>
                              <span className="text-xs text-neutral-500">{item.quantidadeUsada} {insumo?.unidade_medida || 'un'} usados(as)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-neutral-300">R$ {custo.toFixed(2)}</span>
                              <div className="flex gap-1">
                                <button onClick={() => {
                                  setSelectedEmbalagemId(insumo?.id || "");
                                  setTempEmbalagemQtd(item.quantidadeUsada.toString());
                                  removerEmbalagemDaReceita(idx);
                                }} className="text-blue-400/50 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-400/10 transition-colors" title="Editar quantidade"><Edit2 size={16} /></button>
                                <button onClick={() => removerEmbalagemDaReceita(idx)} className="text-red-400/50 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors" title="Remover"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Tempo e Custos Operacionais */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2"><Clock size={16}/> Custos Operacionais</h2>
                    <button onClick={() => setShowConfig(true)} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                      <Settings size={14}/> Editar Valor do Gás e Salário
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-neutral-400 mb-2 block font-medium flex items-center gap-1">
                        Tempo com a Mão na Massa <span className="text-[10px] bg-white/10 px-1 rounded text-neutral-400">R$ {(valorMinutoTrabalho*60).toFixed(2)}/h</span>
                      </label>
                      <div className="relative">
                        <input type="number" value={novaReceita.minutos_preparo_ativo || ""} onChange={e => setNovaReceita({...novaReceita, minutos_preparo_ativo: parseInt(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pr-16 text-white focus:border-blue-500 outline-none transition-colors font-medium" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">min</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-2 block font-medium flex items-center gap-1">
                        Tempo de Forno / Fogão <Flame size={12} className="text-orange-500"/>
                      </label>
                      <div className="relative">
                        <input type="number" value={novaReceita.minutos_forno || ""} onChange={e => setNovaReceita({...novaReceita, minutos_forno: parseInt(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pr-16 text-white focus:border-orange-500 outline-none transition-colors font-medium" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">min</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Taxas de Plataformas / Venda */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-6 flex items-center gap-2"><Target size={16}/> Plataformas de Venda</h2>
                  <div>
                    <label className="text-xs text-neutral-400 mb-2 block font-medium" title="Taxa do iFood, UberEats, ou da sua maquininha de cartão">
                      Taxa do Aplicativo ou Maquininha de Cartão (%)
                    </label>
                    <div className="relative">
                      <input type="number" placeholder="Ex: 20 para iFood" value={novaReceita.taxa_venda || ""} onChange={e => setNovaReceita({...novaReceita, taxa_venda: parseFloat(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pr-16 text-white focus:border-red-500 outline-none transition-colors font-bold" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">%</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-2">
                      O aplicativo vai calcular o seu preço de venda final <strong>absorvendo essa taxa</strong>, garantindo que você não perca nem um centavo da sua margem de lucro para o iFood.
                    </p>
                  </div>
                </section>

              </div>

              {/* DIREITA: Cupom Fiscal Fixo (Sticky) */}
              <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-6">
                
                <div className="bg-gradient-to-b from-neutral-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
                  {/* Decorator line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
                  
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                    <Target size={20} className="text-amber-500"/> Resumo Financeiro
                  </h3>

                  {/* Margem de Lucro Embutida no Resumo */}
                  <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <label className="text-xs text-neutral-400 mb-2 block font-medium">Sua Margem de Lucro Desejada</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={novaReceita.margem_lucro_desejada} onChange={e => setNovaReceita({...novaReceita, margem_lucro_desejada: parseInt(e.target.value) || 0})} className="w-20 bg-black border border-amber-500/30 rounded-xl p-2 text-xl font-bold text-amber-500 text-center outline-none focus:border-amber-500" />
                      <span className="text-amber-500 font-bold text-xl">%</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-neutral-400">
                      <span>Ingredientes Puros</span>
                      <span className="text-white">R$ {res.custoIngredientesPuros.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-neutral-400">
                      <div className="flex items-center gap-2">
                         <span>Margem de Perdas / Segurança</span>
                         <input type="number" value={novaReceita.margem_perda} onChange={e => setNovaReceita({...novaReceita, margem_perda: parseInt(e.target.value) || 0})} className="w-14 bg-black border border-white/10 rounded p-1 text-xs text-center text-white outline-none focus:border-amber-500" /> %
                      </div>
                      <span className="text-white">+ R$ {res.perdas.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-400 pt-2 border-t border-white/5">
                      <span>Embalagens</span>
                      <span className="text-white">R$ {res.custoEmbalagens.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-400">
                      <span>Mão de Obra (Salário)</span>
                      <span className="text-white">R$ {res.custoMaoDeObra.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-400">
                      <span title="Aluguel, Conta de Água, Luz, MEI..." className="cursor-help border-b border-dashed border-neutral-600">
                        Custos Fixos Rateados
                      </span>
                      <span className="text-white">R$ {res.custoRateioFixo.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-400">
                      <span>Gás (Forno/Fogão)</span>
                      <span className="text-white">R$ {res.custoForno.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center font-bold">
                      <span className="text-neutral-300">Custo Total (Lote)</span>
                      <span className="text-red-400">R$ {res.custoTotalReceita.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-8 bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 relative">
                    {novaReceita.rendimento && novaReceita.rendimento > 1 && (
                       <span className="absolute -top-3 left-4 bg-black border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full text-amber-500">
                         Por Unidade
                       </span>
                    )}
                    
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Custo de Fabr.</span>
                      <span className="text-lg font-medium text-neutral-300">R$ {res.custoUnitario.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Preço Sugerido de Venda</span>
                      <span className="text-4xl font-black text-white tracking-tight">R$ {res.precoSugeridoUnitario.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center px-2">
                    <span className="text-xs text-neutral-500 font-medium">Taxas Pagas à Plataforma ({novaReceita.taxa_venda || 0}%):</span>
                    <span className="text-sm text-red-400 font-bold">- R$ {res.descontoTaxa.toFixed(2)}</span>
                  </div>

                  <div className="mt-4 flex justify-between items-center px-4 py-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <span className="text-sm text-green-400 font-medium uppercase tracking-wider">LUCRO REAL LÍQUIDO:</span>
                    <span className="text-xl font-black text-green-400">
                      R$ {res.lucroLiquidoUnitario.toFixed(2)} {novaReceita.rendimento && novaReceita.rendimento > 1 ? '/ un' : ''}
                    </span>
                  </div>

                  <button disabled={isSaving || !novaReceita.nome} onClick={salvarReceitaNoBanco} className="w-full mt-8 bg-white hover:bg-neutral-200 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    <CheckCircle2 size={20}/> {isSaving ? 'Salvando...' : 'Salvar Ficha Técnica'}
                  </button>
                  
                  {!novaReceita.nome && (
                    <p className="text-xs text-amber-500/80 text-center mt-3 flex items-center justify-center gap-1">
                      <AlertCircle size={12}/> Dê um nome ao produto para salvar
                    </p>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
