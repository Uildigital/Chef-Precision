"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, Plus, Clock, ArrowLeft, ChefHat, Trash2, Save, Package, Flame, Target, CheckCircle2, AlertCircle, Settings, Scale, Edit2
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
  
  const [supabase] = useState(() => createClient());

  // Configurações Globais
  const [config, setConfig] = useState({ metaSalarial: 3000, horasMensais: 160, custoFixoPorMinutoForno: 0.15 });
  const [showConfig, setShowConfig] = useState(false);

  const valorMinutoTrabalho = config.metaSalarial / (config.horasMensais * 60);
  const custoFixoPorMinutoForno = config.custoFixoPorMinutoForno;

  // Estado do Construtor (Builder)
  const [novaReceita, setNovaReceita] = useState<Partial<Receita>>({
    nome: "",
    rendimento: 1,
    itens: [],
    minutos_preparo_ativo: 0,
    minutos_forno: 0,
    margem_lucro_desejada: 30
  });

  const [tempInsumo, setTempInsumo] = useState({ nome: "", preco: "", tamanho: "", unidade_medida: "g" });
  const [tempQuantidadeUsada, setTempQuantidadeUsada] = useState("");
  const [selectedInsumoId, setSelectedInsumoId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showInsumoForm, setShowInsumoForm] = useState(false);

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
    carregarDados();
    const savedConfig = localStorage.getItem('chef_precision_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
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
      tamanho_embalagem: parseFloat(tempInsumo.tamanho),
      unidade_medida: tempInsumo.unidade_medida || "g"
    };
    
    const { data, error } = await supabase.from('insumos').insert([novo]).select().single();
    setIsSaving(false);
    
    if (error) {
      console.error("Erro Supabase Insumos:", error);
      alert("Erro ao salvar ingrediente. Verifique a conexão com o banco de dados.");
      return null;
    }

    setInsumos(prev => [data, ...prev]);
    setTempInsumo({ nome: "", preco: "", tamanho: "", unidade_medida: "g" });
    setShowInsumoForm(false);
    if(data) setSelectedInsumoId(data.id);
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
        unidade_medida: editInsumo.unidade_medida
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
      console.error("Erro Supabase Receitas:", error);
      alert("Erro do banco de dados: " + (error.message || JSON.stringify(error)) + "\n\nSe o erro for sobre política de segurança (RLS), lembre-se de desativar o RLS da tabela 'receitas' no painel do Supabase.");
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

  const iniciarNovaPrecificacao = () => {
    setNovaReceita({ nome: "", rendimento: 1, itens: [], minutos_preparo_ativo: 0, minutos_forno: 0, margem_lucro_desejada: 30 });
    setView('builder');
  };

  const editarFichaTecnica = (receita: Receita) => {
    setNovaReceita(receita);
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

      {/* MODAL DO CONVERSOR DE MEDIDAS */}
      <AnimatePresence>
        {showConverter && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Scale className="text-amber-500"/> Conversor Inteligente</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Qual o tipo de Ingrediente?</label>
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
                      {convTipo === 'quilo' ? (
                        <option value="kg">Quilogramas (Kg)</option>
                      ) : convTipo === 'litro' ? (
                        <option value="litro">Litros (L)</option>
                      ) : (
                        <>
                          <option value="xicara">Xícara de Chá</option>
                          <option value="colher_sopa">Colher de Sopa</option>
                          <option value="colher_cha">Colher de Chá</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-neutral-400 block mb-1">Qtd.</label>
                    <input type="number" step="0.5" value={convQtd} onChange={e => setConvQtd(e.target.value)} placeholder="Ex: 2" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-end border-t border-white/5">
                  <span className="text-sm text-neutral-400">Resultado:</span>
                  <span className="text-2xl font-black text-amber-500">{calcularConversao()} {convTipo === 'litro' ? 'ml' : 'g'}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowConverter(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors font-medium">Cancelar</button>
                <button onClick={() => {
                  const res = calcularConversao();
                  if (res > 0) setTempQuantidadeUsada(res.toString());
                  setShowConverter(false);
                  setConvQtd('');
                }} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl transition-colors font-bold">Usar Valor</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EDITAR INSUMO */}
      <AnimatePresence>
        {editInsumo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Edit2 className="text-orange-500"/> Editar Ingrediente</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Nome do Ingrediente</label>
                  <input type="text" value={editInsumo.nome} onChange={e => setEditInsumo({...editInsumo, nome: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500" />
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-neutral-400 block mb-1">Preço Pago (R$)</label>
                    <input type="number" step="0.01" value={editInsumo.preco_embalagem} onChange={e => setEditInsumo({...editInsumo, preco_embalagem: parseFloat(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500" />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-neutral-400 block mb-1">Tamanho</label>
                    <input type="number" value={editInsumo.tamanho_embalagem} onChange={e => setEditInsumo({...editInsumo, tamanho_embalagem: parseFloat(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500" />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-neutral-400 block mb-1">Medida</label>
                    <select value={editInsumo.unidade_medida || 'g'} onChange={e => setEditInsumo({...editInsumo, unidade_medida: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500">
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="un">un</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setEditInsumo(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors font-medium">Cancelar</button>
                <button onClick={atualizarInsumo} disabled={isUpdatingInsumo} className="flex-1 bg-orange-500 hover:bg-orange-400 text-black py-3 rounded-xl transition-colors font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {isUpdatingInsumo ? 'Salvando...' : 'Salvar Preço'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIGURAÇÕES */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-amber-500"/> Configurações de Custos</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Sua Meta Salarial (R$ por mês)</label>
                  <input type="number" value={config.metaSalarial} onChange={e => setConfig({...config, metaSalarial: parseFloat(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Horas Trabalhadas (por mês)</label>
                  <input type="number" value={config.horasMensais} onChange={e => setConfig({...config, horasMensais: parseFloat(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <label className="text-xs text-neutral-400 block mb-3 font-bold text-amber-500">Cálculo Automático do Gás</label>
                  
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-neutral-500 block mb-1">Preço do Botijão cheio (R$)</label>
                      <input type="number" placeholder="Ex: 120" onChange={e => {
                        const preco = parseFloat(e.target.value) || 0;
                        if (preco > 0) setConfig({...config, custoFixoPorMinutoForno: Number((preco / 1800).toFixed(4))});
                      }} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  
                  <label className="text-xs text-neutral-400 block mb-1">Custo final (R$ por minuto)</label>
                  <input type="number" step="0.001" value={config.custoFixoPorMinutoForno} onChange={e => setConfig({...config, custoFixoPorMinutoForno: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-white/10 rounded-lg p-2 text-white outline-none focus:border-amber-500 font-mono" />
                  <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
                    * O sistema calcula automaticamente dividindo o valor do botijão por 1.800 minutos (média de duração de 30 horas de forno ligado).
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowConfig(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors font-medium">Cancelar</button>
                <button onClick={() => {
                  localStorage.setItem('chef_precision_config', JSON.stringify(config));
                  setShowConfig(false);
                }} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl transition-colors font-bold">Salvar Custos</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                        <div key={r.id} onClick={() => editarFichaTecnica(r)} className="group cursor-pointer relative overflow-hidden flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all hover:bg-white/5">
                          <div className="z-10">
                            <p className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors">{r.nome}</p>
                            <p className="text-xs text-neutral-400 mt-1">Lote R$ {r.preco_sugerido?.toFixed(2)}</p>
                          </div>
                          <div className="z-10 text-right">
                            <p className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded-md inline-block border border-green-400/20 mb-1 block w-fit ml-auto">
                              + R$ {r.lucro_liquido?.toFixed(2)}
                            </p>
                            <span className="text-[10px] text-neutral-500 group-hover:text-amber-500 transition-colors block">Clique para editar</span>
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
                          <span className="text-sm font-medium text-neutral-300 group-hover:text-orange-400 transition-colors">{i.nome}</span>
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
                        {insumos.map(i => <option key={i.id} value={i.id}>{i.nome} (R$ {i.preco_embalagem.toFixed(2)} / {i.tamanho_embalagem}{i.unidade_medida || 'g'})</option>)}
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
