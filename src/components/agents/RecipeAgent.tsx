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
    const custoMaoDeObra = MathSkill.calcularCustoMaoDeObra(receita, config);
    const custoOperacional = MathSkill.calcularCustoOperacional(receita, config);
    
    const custoSubtotal = custoIngredientes + custoMaoDeObra + custoOperacional;
    const custoTotal = custoSubtotal * (1 + (config.taxa_fixa / 100));
    const precoSugerido = custoTotal * (receita.margem_desejada || 3);
    const tempoTotal = (receita.tempo_preparo || 0) + (receita.tempo_forno || 0);

    return (
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="p-6 max-w-4xl mx-auto pb-40">
            <button onClick={onVoltar} className="mb-8 flex items-center gap-2 text-[10px] font-black opacity-20 uppercase tracking-widest"><ArrowLeft size={16} /> Voltar</button>
            <div className="bg-white p-10 rounded-[4rem] shadow-3xl border border-black/5 space-y-12">
                <header className="text-center">
                    <h2 className="text-4xl font-black italic mb-3">{receita.nome}</h2>
                    <div className="flex justify-center gap-3">
                        <span className="px-4 py-2 bg-[#F5F5F5] rounded-full text-[9px] font-bold uppercase tracking-widest">Rende {receita.rendimento} un</span>
                        <span className="px-4 py-2 bg-[#F5F5F5] rounded-full text-[9px] font-bold uppercase tracking-widest">{tempoTotal} min</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-[#F5F5F5] rounded-[2rem] text-center">
                        <span className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Material</span>
                        <p className="text-xl font-black">{MathSkill.formatarMoeda(custoIngredientes)}</p>
                    </div>
                    <div className="p-6 bg-[#F5F5F5] rounded-[2rem] text-center">
                        <span className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Trabalho</span>
                        <p className="text-xl font-black">{MathSkill.formatarMoeda(custoMaoDeObra)}</p>
                    </div>
                    <div className="p-6 bg-[#F5F5F5] rounded-[2rem] text-center">
                        <span className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Contas</span>
                        <p className="text-xl font-black">{MathSkill.formatarMoeda(custoOperacional)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-8 bg-[#F5F5F5] rounded-[3rem] text-center">
                        <span className="text-[10px] font-black uppercase text-black/30 tracking-widest block mb-1">Custo Total</span>
                        <p className="text-3xl font-black">{MathSkill.formatarMoeda(custoTotal)}</p>
                    </div>
                    <div className="p-8 bg-[#D4AF37] rounded-[3rem] text-center text-white shadow-2xl">
                        <span className="text-[10px] font-black uppercase text-white/50 tracking-widest block mb-1">Custo Unitário</span>
                        <p className="text-3xl font-black">{MathSkill.formatarMoeda(custoTotal / receita.rendimento)}</p>
                    </div>
                </div>

                <div className="bg-[#1A1A1A] text-white p-12 rounded-[4rem] flex flex-col items-center gap-6 relative overflow-hidden text-center">
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-4 block">Sugestão de Venda</span>
                        <h3 className="text-7xl font-black text-white italic">{MathSkill.formatarMoeda(precoSugerido)}</h3>
                        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] mt-6">Precificação inteligente via Chef Precision</p>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] opacity-5 rotate-12"><DollarSign size={200} /></div>
                </div>
            </div>
        </motion.div>
    );
}
