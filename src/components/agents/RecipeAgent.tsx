"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronRight, ArrowLeft, DollarSign, Sparkles } from "lucide-react";
import { MathSkill } from "@/lib/logic/MathSkill";

export function RecipeAgent({ receitas, insumos, onVisualizar, onSalvar, onExcluir, receitaEmEdicao, onVoltar, config }: any) {
    const [isNovo, setIsNovo] = useState(false);
    const [novo, setNovo] = useState<any>({ nome: '', itens: [], rendimento: 1, margem_desejada: 3, tempo_preparo: 0, tempo_forno: 0 });
    const [selId, setSelId] = useState("");
    const [selQt, setSelQt] = useState(0);

    const addItem = () => {
        if (!selId || selQt <= 0) return;
        setNovo({ ...novo, itens: [...(novo.itens || []), { id_insumo: selId, quantidade_usada: selQt }] });
        setSelId(""); setSelQt(0);
    };

    if (receitaEmEdicao) {
        return <DetalheCalculo receita={receitaEmEdicao} insumos={insumos} config={config} onVoltar={onVoltar} />;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-4xl mx-auto pb-32">
            <header className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black tracking-tighter">Fichas Técnicas</h2>
                <button onClick={() => setIsNovo(true)} className="h-14 w-14 bg-[#D4AF37] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Plus /></button>
            </header>

            <AnimatePresence>
                {isNovo && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1 }} className="mb-12 bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-[#FDFCFB] space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em] pl-2 border-l-4 border-[#D4AF37]">Nova Receita</h3>
                            <input type="text" placeholder="Ex: Bolo de Brigadeiro Belga" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} className="w-full bg-[#F5F5F5] p-6 rounded-2xl outline-none font-black text-sm" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/30 pl-2">Rendimento (un)</label><input type="number" value={novo.rendimento} onChange={e => setNovo({ ...novo, rendimento: parseFloat(e.target.value) })} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" /></div>
                                <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/30 pl-2">Margem Desejada</label><input type="number" value={novo.margem_desejada} onChange={e => setNovo({ ...novo, margem_desejada: parseFloat(e.target.value) })} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/30 pl-2">Tempo Preparo (Min)</label><input type="number" value={novo.tempo_preparo} onChange={e => setNovo({...novo, tempo_preparo: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" /></div>
                               <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/30 pl-2">Tempo Forno (Min)</label><input type="number" value={novo.tempo_forno} onChange={e => setNovo({...novo, tempo_forno: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" /></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em] pl-2 border-l-4 border-[#D4AF37]">Composição</h3>
                            <div className="flex gap-2">
                                <select value={selId} onChange={e => setSelId(e.target.value)} className="flex-1 bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-xs">
                                    <option value="">Ingrediente...</option>
                                    {insumos.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <input type="number" placeholder="Qtd" value={selQt} onChange={e => setSelQt(parseFloat(e.target.value))} className="w-24 bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-xs" />
                                <button onClick={addItem} className="h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all"><Plus size={20} /></button>
                            </div>
                            <div className="space-y-2">
                                {novo.itens?.map((it: any, idx: number) => (
                                    <div key={idx} className="flex justify-between p-4 bg-[#F5F5F5] rounded-xl font-bold text-xs text-black/40"><span>{insumos.find((i: any) => i.id === it.id_insumo)?.name}</span><span>{it.quantidade_usada}</span></div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setIsNovo(false)} className="py-5 bg-[#F5F5F5] text-black/40 font-black text-[10px] uppercase rounded-2xl">Descartar</button>
                            <button onClick={() => { onSalvar(novo); setIsNovo(false); }} className="py-5 bg-black text-white font-black text-[10px] uppercase rounded-2xl shadow-xl flex items-center justify-center gap-2"><Sparkles size={14} /> Criar Ficha</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {receitas.map((r: any) => (
                    <div key={r.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-black/5 flex flex-col justify-between group active:scale-95 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black italic">{r.nome}</h3>
                            <button onClick={() => onExcluir(r.id)} className="h-10 w-10 text-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex items-end justify-between">
                            <div><span className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em] block">Custo p/ Receita</span><p className="text-lg font-black">R$ {MathSkill.calcularCustoIngredientes(r.itens, insumos).toFixed(2)}</p></div>
                            <button onClick={() => onVisualizar(r)} className="h-14 w-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all"><ChevronRight /></button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function DetalheCalculo({ receita, insumos, config, onVoltar }: any) {
    const custoIngredientes = MathSkill.calcularCustoIngredientes(receita.itens, insumos);
    const { laborCost, operationalCost } = MathSkill.calcularCustoOperacional(receita, config);
    
    const subtotal = custoIngredientes + laborCost + operationalCost;
    const custoTotal = subtotal * (1 + (config.taxa_fixa / 100));
    const precoSugerido = custoTotal * (receita.margem_desejada || 3);
    const tempoTotal = (receita.tempo_preparo || 0) + (receita.tempo_forno || 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto pb-40">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onVoltar} className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase tracking-widest hover:opacity-100 transition-opacity"><ArrowLeft size={16} /> Voltar para Fichas</button>
                <div className="px-6 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full">
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Relatório de Lucratividade v2.1</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna de Detalhes da Receita */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
                        <header className="mb-10 border-b border-black/5 pb-8">
                            <h2 className="text-4xl font-black italic mb-2">{receita.nome}</h2>
                            <div className="flex gap-4">
                                <span className="text-[10px] font-black uppercase text-black/40 bg-[#F5F5F5] px-3 py-1 rounded-full">Rendimento: {receita.rendimento} un</span>
                                <span className="text-[10px] font-black uppercase text-black/40 bg-[#F5F5F5] px-3 py-1 rounded-full">Tempo Total: {tempoTotal} min</span>
                            </div>
                        </header>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Composição de Custos</h3>
                            <div className="grid gap-3">
                                {receita.itens.map((it: any, idx: number) => {
                                    const ins = insumos.find((i: any) => i.id === it.id_insumo);
                                    if (!ins) return null;
                                    const itemCost = MathSkill.calcularCustoIngredientes([it], insumos);
                                    return (
                                        <div key={idx} className="flex justify-between items-center p-5 bg-[#FDFCFB] border border-black/5 rounded-2xl hover:border-[#D4AF37]/20 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-2 w-2 bg-[#D4AF37] rounded-full group-hover:scale-150 transition-transform"></div>
                                                <div>
                                                    <p className="text-sm font-bold uppercase">{ins.name}</p>
                                                    <p className="text-[9px] font-black text-black/20 uppercase tracking-wider">{it.quantidade_usada}{ins.unit} • Compra: {ins.quantity}{ins.unit} p/ R$ {ins.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black">{MathSkill.formatarMoeda(itemCost)}</p>
                                                {ins.yield_percentage < 100 && (
                                                    <p className="text-[8px] font-bold text-red-400 uppercase">Considerando {ins.yield_percentage}% de aproveitamento</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Financeira (O Painel de Decisão) */}
                <div className="space-y-8">
                    <div className="bg-[#1A1A1A] text-white p-10 rounded-[4rem] shadow-3xl relative overflow-hidden">
                        <div className="relative z-10 space-y-8 text-center">
                            <div>
                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-4 block">Preço de Venda Sugerido</span>
                                <h3 className="text-6xl font-black italic">{MathSkill.formatarMoeda(precoSugerido)}</h3>
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-4">Markup Aplicado: {receita.margem_desejada}x</p>
                            </div>

                            <div className="pt-8 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Custo de Produção</span>
                                    <span className="text-sm font-black">{MathSkill.formatarMoeda(custoTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Lucro por Batida</span>
                                    <span className="text-sm font-black text-[#D4AF37]">{MathSkill.formatarMoeda(precoSugerido - custoTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Custo p/ Unidade</span>
                                    <span className="text-sm font-black">{MathSkill.formatarMoeda(custoTotal / receita.rendimento)}</span>
                                </div>
                            </div>

                            <button className="w-full py-5 bg-[#D4AF37] text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                                <DollarSign size={16} /> Exportar Relatório 
                            </button>
                        </div>
                        <div className="absolute top-[-20%] right-[-10%] opacity-5 rotate-12"><DollarSign size={200} /></div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-black/5 space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-black/30 tracking-[0.3em] text-center">Resumo Operacional</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-blue-400 rounded-full"></div><span className="text-[9px] font-black opacity-40 uppercase">Mão de Obra</span></div>
                                <span className="text-xs font-black">{MathSkill.formatarMoeda(laborCost)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-orange-400 rounded-full"></div><span className="text-[9px] font-black opacity-40 uppercase">Custo Fixo (Rateio)</span></div>
                                <span className="text-xs font-black">{MathSkill.formatarMoeda(operationalCost)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-black/5 font-black">
                                <span className="text-[9px] opacity-40 uppercase">Total Operacional</span>
                                <span className="text-xs">{MathSkill.formatarMoeda(laborCost + operationalCost)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
