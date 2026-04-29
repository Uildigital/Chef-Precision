"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  Plus, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  ChefHat,
  Trash2,
  Save,
  Package
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
  itens: ItemUsado[];
  minutos_preparo_ativo: number;
  minutos_forno: number;
  margem_lucro_desejada: number; 
  preco_sugerido?: number;
  lucro_liquido?: number;
}

export default function AppCalculadora() {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitasSalvas, setReceitasSalvas] = useState<Receita[]>([]);
  
  const supabase = createClient();

  // Configurações Globais Fixas
  const metaSalarial = 3000;
  const horasMensais = 160;
  const valorMinutoTrabalho = metaSalarial / (horasMensais * 60); // R$ 0,31/min
  const custoFixoPorMinutoForno = 0.15;

  // Estado do Wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [novaReceita, setNovaReceita] = useState<Partial<Receita>>({
    nome: "",
    itens: [],
    minutos_preparo_ativo: 0,
    minutos_forno: 0,
    margem_lucro_desejada: 30
  });

  const [tempInsumo, setTempInsumo] = useState({ nome: "", preco: "", tamanho: "" });
  const [tempQuantidadeUsada, setTempQuantidadeUsada] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados do Supabase ao iniciar
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
    return data as Insumo;
  };

  const salvarReceitaNoBanco = async () => {
    const res = calcularResultados();
    const receitaParaSalvar = {
      nome: novaReceita.nome,
      itens: novaReceita.itens,
      minutos_preparo_ativo: novaReceita.minutos_preparo_ativo,
      minutos_forno: novaReceita.minutos_forno,
      margem_lucro_desejada: novaReceita.margem_lucro_desejada,
      preco_sugerido: res.precoSugerido,
      lucro_liquido: res.lucroLiquido
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

  // --- O Motor de Cálculo Lógico ---
  const calcularCustoIngredientes = () => {
    if (!novaReceita.itens) return 0;
    return novaReceita.itens.reduce((total, item) => {
      const insumoInfo = insumos.find(i => i.id === item.insumoId);
      if (!insumoInfo) return total;
      const custoPorGrama = insumoInfo.preco_embalagem / insumoInfo.tamanho_embalagem;
      return total + (custoPorGrama * item.quantidadeUsada);
    }, 0);
  };

  const calcularResultados = () => {
    const custoIngredientes = calcularCustoIngredientes();
    const custoMaoDeObra = (novaReceita.minutos_preparo_ativo || 0) * valorMinutoTrabalho;
    const custoForno = (novaReceita.minutos_forno || 0) * custoFixoPorMinutoForno;
    
    const custoTotalReal = custoIngredientes + custoMaoDeObra + custoForno;
    
    const margem = (novaReceita.margem_lucro_desejada || 0) / 100;
    const precoSugerido = custoTotalReal / (1 - margem);
    const lucroLiquido = precoSugerido - custoTotalReal;

    return { custoTotalReal, precoSugerido, lucroLiquido, custoIngredientes, custoMaoDeObra, custoForno };
  };

  const iniciarNovaPrecificacao = () => {
    setNovaReceita({ nome: "", itens: [], minutos_preparo_ativo: 0, minutos_forno: 0, margem_lucro_desejada: 30 });
    setWizardStep(1);
    setView('wizard');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-amber-500 selection:text-black">
      <header className="fixed top-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ChefHat className="text-amber-500" size={24} />
          <h1 className="font-bold text-lg tracking-tight">Chef Precision</h1>
        </div>
        {view === 'wizard' && (
          <button onClick={() => setView('dashboard')} className="text-sm font-medium text-neutral-400 hover:text-white flex items-center gap-1">
            <ArrowLeft size={16} /> Voltar
          </button>
        )}
      </header>

      <main className="pt-24 pb-10 px-6 max-w-md mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          
          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center py-10 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mb-2">
                  <Calculator size={32} />
                </div>
                <h2 className="text-3xl font-black">Precificação sem achismos.</h2>
              </div>

              <button onClick={iniciarNovaPrecificacao} className="w-full bg-amber-500 text-neutral-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                <Plus size={20} /> Nova Precificação
              </button>

              {/* Lista de Fichas */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300">
                  <Save size={18} /> Suas Fichas ({receitasSalvas.length})
                </h3>
                {receitasSalvas.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">Nenhuma receita calculada.</p>
                ) : (
                  <div className="space-y-3">
                    {receitasSalvas.map(r => (
                      <div key={r.id} className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-neutral-800">
                        <div>
                          <p className="font-medium text-sm">{r.nome}</p>
                          <p className="text-xs text-amber-500 font-bold">Venda: R$ {r.preco_sugerido?.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded">Lucro: R$ {r.lucro_liquido?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300">
                  <Package size={18} /> Insumos Registrados ({insumos.length})
                </h3>
                {insumos.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">Nenhum insumo cadastrado.</p>
                ) : (
                  <div className="space-y-3">
                    {insumos.slice(0, 3).map(i => (
                      <div key={i.id} className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                        <span>{i.nome}</span>
                        <span className="text-amber-500 font-medium">R$ {i.preco_embalagem.toFixed(2)} / {i.tamanho_embalagem}g</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* WIZARD */}
          {view === 'wizard' && (
            <motion.div key="wizard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-6">
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className={`h-1 flex-1 rounded-full ${wizardStep >= step ? 'bg-amber-500' : 'bg-neutral-800'}`} />
                ))}
              </div>

              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black mb-2">O que vamos precificar?</h2>
                    <p className="text-neutral-400 text-sm">Dê um nome para este produto.</p>
                  </div>
                  <input type="text" placeholder="Ex: Bolo de Cenoura" value={novaReceita.nome || ""} onChange={e => setNovaReceita({...novaReceita, nome: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-lg focus:border-amber-500 outline-none" />
                  <button disabled={!novaReceita.nome} onClick={() => setWizardStep(2)} className="w-full bg-white text-black font-bold py-4 rounded-xl disabled:opacity-50 mt-8">Continuar</button>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div><h2 className="text-2xl font-black mb-2">Ingredientes usados</h2></div>

                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-3">
                    <p className="text-xs font-bold text-amber-500 uppercase">Novo Ingrediente no Banco</p>
                    <input type="text" placeholder="Nome" value={tempInsumo.nome} onChange={e => setTempInsumo({...tempInsumo, nome: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-sm outline-none" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Preço (R$)" value={tempInsumo.preco} onChange={e => setTempInsumo({...tempInsumo, preco: e.target.value})} className="w-1/2 bg-black border border-neutral-800 rounded-lg p-3 text-sm outline-none" />
                      <input type="number" placeholder="Tamanho (g/ml)" value={tempInsumo.tamanho} onChange={e => setTempInsumo({...tempInsumo, tamanho: e.target.value})} className="w-1/2 bg-black border border-neutral-800 rounded-lg p-3 text-sm outline-none" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <input type="number" placeholder="Qtd Usada nesta receita (g/ml)" value={tempQuantidadeUsada} onChange={e => setTempQuantidadeUsada(e.target.value)} className="flex-1 bg-black border border-neutral-800 rounded-lg p-3 text-sm outline-none border-amber-500/30" />
                      <button 
                        onClick={async () => {
                          const novo = await salvarNovoInsumo();
                          if (novo && tempQuantidadeUsada) {
                            adicionarItemAReceita(novo.id, parseFloat(tempQuantidadeUsada));
                            setTempQuantidadeUsada("");
                          }
                        }}
                        disabled={isSaving}
                        className="bg-amber-500 text-black px-4 rounded-lg font-bold disabled:opacity-50"
                      >
                        {isSaving ? '...' : 'Add'}
                      </button>
                    </div>
                  </div>

                  {novaReceita.itens && novaReceita.itens.length > 0 && (
                    <div className="space-y-2 pt-4">
                      <p className="text-xs font-bold text-neutral-500 uppercase">Na Receita:</p>
                      {novaReceita.itens.map((item, idx) => {
                        const insumo = insumos.find(i => i.id === item.insumoId);
                        const custo = insumo ? (insumo.preco_embalagem / insumo.tamanho_embalagem) * item.quantidadeUsada : 0;
                        return (
                          <div key={idx} className="flex justify-between items-center bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                            <div>
                              <p className="text-sm font-medium">{insumo?.nome || 'Carregando...'}</p>
                              <p className="text-xs text-neutral-500">{item.quantidadeUsada}g • R$ {custo.toFixed(2)}</p>
                            </div>
                            <button onClick={() => removerItemDaReceita(idx)} className="text-red-400"><Trash2 size={16} /></button>
                          </div>
                        );
                      })}
                      <div className="text-right pt-2">
                        <p className="text-sm font-bold text-amber-500">Subtotal: R$ {calcularCustoIngredientes().toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-6">
                    <button onClick={() => setWizardStep(1)} className="w-1/3 bg-neutral-800 font-bold py-4 rounded-xl">Voltar</button>
                    <button onClick={() => setWizardStep(3)} className="w-2/3 bg-white text-black font-bold py-4 rounded-xl">Avançar</button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div><h2 className="text-2xl font-black mb-2">Mão de Obra</h2></div>
                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                    <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Minutos de Preparo</label>
                    <input type="number" value={novaReceita.minutos_preparo_ativo || ""} onChange={e => setNovaReceita({...novaReceita, minutos_preparo_ativo: parseInt(e.target.value) || 0})} className="w-full bg-black rounded-lg p-3 text-lg outline-none" />
                  </div>
                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                    <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Minutos de Forno/Gás</label>
                    <input type="number" value={novaReceita.minutos_forno || ""} onChange={e => setNovaReceita({...novaReceita, minutos_forno: parseInt(e.target.value) || 0})} className="w-full bg-black rounded-lg p-3 text-lg outline-none" />
                  </div>
                  <div className="flex gap-2 pt-6">
                    <button onClick={() => setWizardStep(2)} className="w-1/3 bg-neutral-800 font-bold py-4 rounded-xl">Voltar</button>
                    <button onClick={() => setWizardStep(4)} className="w-2/3 bg-amber-500 text-black font-bold py-4 rounded-xl">Ver Resultado</button>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div><h2 className="text-2xl font-black mb-2">Resultado Final</h2></div>

                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                    <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Margem Desejada (%)</label>
                    <input type="number" value={novaReceita.margem_lucro_desejada} onChange={e => setNovaReceita({...novaReceita, margem_lucro_desejada: parseInt(e.target.value) || 0})} className="w-full bg-black border border-amber-500/50 rounded-lg p-3 text-2xl font-black text-amber-500 text-center" />
                  </div>

                  {(() => {
                    const res = calcularResultados();
                    return (
                      <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 shadow-xl">
                        <div className="space-y-2 mb-4 text-sm text-neutral-300">
                          <div className="flex justify-between"><span>Ingredientes</span><span>R$ {res.custoIngredientes.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Mão de Obra</span><span>R$ {res.custoMaoDeObra.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Custos Fixos</span><span>R$ {res.custoForno.toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold pt-2 border-t border-neutral-700"><span>Custo Total</span><span className="text-red-400">R$ {res.custoTotalReal.toFixed(2)}</span></div>
                        </div>

                        <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 mb-4">
                          <p className="text-xs text-neutral-400 uppercase font-bold text-center mb-1">Preço Sugerido</p>
                          <p className="text-4xl font-black text-white text-center">R$ {res.precoSugerido.toFixed(2)}</p>
                        </div>

                        <div className="flex justify-between text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 font-bold">
                          <span>Lucro Líquido</span><span>+ R$ {res.lucroLiquido.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex gap-2 pt-4">
                    <button onClick={() => setWizardStep(3)} className="w-1/3 bg-neutral-800 font-bold py-4 rounded-xl">Ajustar</button>
                    <button disabled={isSaving} onClick={salvarReceitaNoBanco} className="w-2/3 bg-white text-black flex justify-center gap-2 font-bold py-4 rounded-xl disabled:opacity-50">
                      <Save size={18}/> {isSaving ? 'Salvando...' : 'Salvar Ficha'}
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
