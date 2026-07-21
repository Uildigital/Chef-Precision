"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, Plus, Clock, ArrowLeft, ChefHat, Trash2, Save, Package, Flame, Target, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// --- Tipos Essenciais ---
interface Insumo {
  id: string;
  nome: string;
  preco_embalagem: number;
  tamanho_embalagem: number;
}

interface ItemUsado {
  insumoId: string;
  quantidadeUsada: number;
}

interface Receita {
  id: string;
  nome: string;
  rendimento: number; // Nova propriedade
  itens: ItemUsado[];
  minutos_preparo_ativo: number;
  minutos_forno: number;
  margem_lucro_desejada: number; 
  preco_sugerido?: number;
  lucro_liquido?: number;
}

export default function AppCalculadora() {
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitasSalvas, setReceitasSalvas] = useState<Receita[]>([]);
  
  const supabase = createClient();

  // Configurações Globais Fixas
  const metaSalarial = 3000;
  const horasMensais = 160;
  const valorMinutoTrabalho = metaSalarial / (horasMensais * 60); // R$ 0,31/min
  const custoFixoPorMinutoForno = 0.15;

  // Estado do Construtor (Builder)
  const [novaReceita, setNovaReceita] = useState<Partial<Receita>>({
    nome: "",
    rendimento: 1,
    itens: [],
    minutos_preparo_ativo: 0,
    minutos_forno: 0,
    margem_lucro_desejada: 30
  });

  const [tempInsumo, setTempInsumo] = useState({ nome: "", preco: "", tamanho: "" });
  const [tempQuantidadeUsada, setTempQuantidadeUsada] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showInsumoForm, setShowInsumoForm] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

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
      tamanho_embalagem: parseFloat(tempInsumo.tamanho)
    };
    
    const { data, error } = await supabase.from('insumos').insert([novo]).select().single();
    setIsSaving(false);
    
    if (error) {
      console.error(error);
      return null;
    }

    setInsumos(prev => [data, ...prev]);
    setTempInsumo({ nome: "", preco: "", tamanho: "" });
    setShowInsumoForm(false);
    return data as Insumo;
  };

  const calcularResultados = () => {
    const custoIngredientes = (novaReceita.itens || []).reduce((total, item) => {
      const insumoInfo = insumos.find(i => i.id === item.insumoId);
      if (!insumoInfo) return total;
      const custoPorGrama = insumoInfo.preco_embalagem / insumoInfo.tamanho_embalagem;
      return total + (custoPorGrama * item.quantidadeUsada);
    }, 0);

    const custoMaoDeObra = (novaReceita.minutos_preparo_ativo || 0) * valorMinutoTrabalho;
    const custoForno = (novaReceita.minutos_forno || 0) * custoFixoPorMinutoForno;
    const custoTotalReceita = custoIngredientes + custoMaoDeObra + custoForno;
    
    const rendimento = novaReceita.rendimento || 1;
    const custoUnitario = custoTotalReceita / rendimento;
    
    const margem = (novaReceita.margem_lucro_desejada || 0) / 100;
    const precoSugeridoUnitario = custoUnitario / (1 - margem);
    const lucroLiquidoUnitario = precoSugeridoUnitario - custoUnitario;

    const precoSugeridoTotal = precoSugeridoUnitario * rendimento;
    const lucroLiquidoTotal = lucroLiquidoUnitario * rendimento;

    return { 
      custoIngredientes, custoMaoDeObra, custoForno, 
      custoTotalReceita, custoUnitario, 
      precoSugeridoUnitario, lucroLiquidoUnitario,
      precoSugeridoTotal, lucroLiquidoTotal
    };
  };

  const salvarReceitaNoBanco = async () => {
    if (!novaReceita.nome) return alert("Dê um nome para a receita antes de salvar.");
    const res = calcularResultados();
    const receitaParaSalvar = {
      nome: novaReceita.nome,
      rendimento: novaReceita.rendimento || 1,
      itens: novaReceita.itens,
      minutos_preparo_ativo: novaReceita.minutos_preparo_ativo,
      minutos_forno: novaReceita.minutos_forno,
      margem_lucro_desejada: novaReceita.margem_lucro_desejada,
      preco_sugerido: res.precoSugeridoTotal,
      lucro_liquido: res.lucroLiquidoTotal
    };

    setIsSaving(true);
    const { data, error } = await supabase.from('receitas').insert([receitaParaSalvar]).select().single();
    setIsSaving(false);

    if (!error && data) {
      setReceitasSalvas(prev => [data, ...prev]);
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

  const iniciarNovaPrecificacao = () => {
    setNovaReceita({ nome: "", rendimento: 1, itens: [], minutos_preparo_ativo: 0, minutos_forno: 0, margem_lucro_desejada: 30 });
    setView('builder');
  };

  const res = view === 'builder' ? calcularResultados() : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 font-sans selection:bg-amber-500 selection:text-black">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50 px-6 py-4 flex justify-between items-center shadow-2xl shadow-black">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <ChefHat className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Chef Precision</h1>
        </div>
        {view === 'builder' && (
          <button onClick={() => setView('dashboard')} className="text-sm font-medium text-neutral-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
        )}
      </header>

      <main className="pt-24 pb-10 px-6 max-w-7xl mx-auto min-h-screen">
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
                        <div key={r.id} className="group relative overflow-hidden flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="z-10">
                            <p className="font-bold text-sm text-white">{r.nome}</p>
                            <p className="text-xs text-neutral-400 mt-1">Lote R$ {r.preco_sugerido?.toFixed(2)}</p>
                          </div>
                          <div className="z-10 text-right">
                            <p className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded-md inline-block border border-green-400/20">
                              + R$ {r.lucro_liquido?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Insumos */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                  <h3 className="font-bold mb-6 flex items-center gap-2 text-neutral-200">
                    <Package size={20} className="text-orange-500"/> Despensa
                  </h3>
                  {insumos.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-8">Sua despensa está vazia.</p>
                  ) : (
                    <div className="space-y-3">
                      {insumos.slice(0, 5).map(i => (
                        <div key={i.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                          <span className="text-sm font-medium text-neutral-300">{i.nome}</span>
                          <span className="text-xs font-bold text-neutral-500 bg-white/5 px-2 py-1 rounded">
                            R$ {i.preco_embalagem.toFixed(2)} / {i.tamanho_embalagem}g
                          </span>
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
                      <label className="text-xs text-neutral-400 mb-2 block font-medium">Rende quantas unidades?</label>
                      <input type="number" min="1" placeholder="Ex: 100" value={novaReceita.rendimento || ""} onChange={e => setNovaReceita({...novaReceita, rendimento: parseInt(e.target.value) || 1})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-colors font-bold text-center" />
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
                            <input type="number" placeholder="Preço Pago (R$)" value={tempInsumo.preco} onChange={e => setTempInsumo({...tempInsumo, preco: e.target.value})} className="w-32 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" />
                            <input type="number" placeholder="Peso na Emb. (g)" value={tempInsumo.tamanho} onChange={e => setTempInsumo({...tempInsumo, tamanho: e.target.value})} className="w-32 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" />
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
                      <select onChange={(e) => {
                        const id = e.target.value;
                        if(id) {
                           setNovaReceita(prev => ({...prev, _tempSelectedInsumo: id}));
                        }
                      }} defaultValue="" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-neutral-300 outline-none focus:border-amber-500 appearance-none">
                        <option value="" disabled>Selecione um ingrediente da despensa...</option>
                        {insumos.map(i => <option key={i.id} value={i.id}>{i.nome} (R$ {i.preco_embalagem.toFixed(2)}/{i.tamanho_embalagem}g)</option>)}
                      </select>
                    </div>
                    <input type="number" placeholder="Qtd Usada (g/ml)" value={tempQuantidadeUsada} onChange={e => setTempQuantidadeUsada(e.target.value)} className="w-full md:w-40 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" />
                    <button 
                      onClick={() => {
                        const insumoId = (novaReceita as any)._tempSelectedInsumo;
                        if (insumoId && tempQuantidadeUsada) {
                          adicionarItemAReceita(insumoId, parseFloat(tempQuantidadeUsada));
                          setTempQuantidadeUsada("");
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
                              <span className="text-xs text-neutral-500">{item.quantidadeUsada} gramas usadas</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-neutral-300">R$ {custo.toFixed(2)}</span>
                              <button onClick={() => removerItemDaReceita(idx)} className="text-red-400/50 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Tempo e Custos Operacionais */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-6 flex items-center gap-2"><Clock size={16}/> Custos Operacionais</h2>
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
                      <span>Ingredientes</span>
                      <span className="text-white">R$ {res.custoIngredientes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-400">
                      <span>Mão de Obra</span>
                      <span className="text-white">R$ {res.custoMaoDeObra.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-400">
                      <span>Gás / Energia</span>
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
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Preço de Venda</span>
                      <span className="text-4xl font-black text-white tracking-tight">R$ {res.precoSugeridoUnitario.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center px-2">
                    <span className="text-xs text-neutral-500 font-medium">Lucro Líquido no bolso:</span>
                    <span className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">
                      + R$ {res.lucroLiquidoUnitario.toFixed(2)} {novaReceita.rendimento && novaReceita.rendimento > 1 ? '/ un' : ''}
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
