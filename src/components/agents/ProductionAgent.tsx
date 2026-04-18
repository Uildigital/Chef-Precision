"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowLeft, ShoppingCart, Info } from "lucide-react";

export function ProductionAgent({ receitas, insumos, onVoltar }: any) {
    const [listaProducao, setListaProducao] = useState<{id_receita: string, quantidade: number}[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [selectedQt, setSelectedQt] = useState(1);

    const addNaLista = () => {
        if(!selectedId) return;
        setListaProducao([...listaProducao, { id_receita: selectedId, quantidade: selectedQt }]);
        setSelectedId("");
        setSelectedQt(1);
    };

    const consolidado = useMemo(() => {
        const itens: { [key: string]: { name: string, total: number, unit: string } } = {};
        
        listaProducao.forEach(prod => {
            const rec = receitas.find((r:any) => r.id === prod.id_receita);
            if (!rec) return;
            
            const fator = prod.quantity_multiplier || (prod.quantidade / rec.rendimento);
            
            rec.itens.forEach((it: any) => {
                const ins = insumos.find((i: any) => i.id === it.id_insumo);
                if (!ins) return;
                
                if (itens[it.id_insumo]) {
                    itens[it.id_insumo].total += it.quantidade_usada * fator;
                } else {
                    itens[it.id_insumo] = {
                        name: ins.name,
                        total: it.quantidade_usada * fator,
                        unit: ins.unit
                    };
                }
            });
        });
        
        return Object.values(itens);
    }, [listaProducao, receitas, insumos]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32">
            <header className="mb-10">
                <button onClick={onVoltar} className="mb-6 h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40"><ArrowLeft size={18}/></button>
                <h2 className="text-3xl font-black italic">Produção Planejada</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Gere sua lista de compras automaticamente</p>
            </header>
            
            <div className="space-y-6">
                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em] mb-4">O que será produzido?</h3>
                    <div className="flex gap-3">
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="flex-1 bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-[#D4AF37] font-bold text-xs appearance-none">
                            <option value="">Selecione...</option>
                            {receitas.map((r: any) => <option key={r.id} value={r.id}>{r.nome}</option>)}
                        </select>
                        <input type="number" placeholder="Qtd" value={selectedQt} onChange={e => setSelectedQt(parseFloat(e.target.value))} className="w-24 bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-[#D4AF37] font-black text-xs text-center" />
                        <button onClick={addNaLista} className="h-16 w-16 bg-[#D4AF37] text-black rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-[#D4AF37]/10"><Plus/></button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {listaProducao.map((p, idx) => (
                            <div key={idx} className="bg-white/10 text-white px-4 py-3 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-white/5">
                                {receitas.find((r:any)=>r.id === p.id_receita)?.nome} ({p.quantidade})
                                <button onClick={() => setListaProducao(listaProducao.filter((_, i) => i !== idx))} className="text-white/20 hover:text-red-400"><X size={14}/></button>
                            </div>
                        ))}
                        {listaProducao.length === 0 && <p className="text-[9px] font-black uppercase tracking-widest text-white/20 py-4 italic">Nenhuma receita na produção...</p>}
                    </div>
                </div>

                <AnimatePresence>
                    {consolidado.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#D4AF37] p-10 rounded-[4rem] text-black shadow-3xl shadow-[#D4AF37]/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <ShoppingCart size={20} />
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em]">Lista de Compras</h3>
                                </div>
                                <div className="grid gap-4">
                                    {consolidado.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-black/10 pb-4">
                                            <span className="font-bold text-base">{item.name}</span>
                                            <span className="font-black text-lg">{item.total.toLocaleString('pt-BR')} {item.unit}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 flex items-center gap-3 opacity-40 italic">
                                    <Info size={14}/>
                                    <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Quantidades baseadas no rendimento total das receitas selecionadas.</p>
                                </div>
                            </div>
                            <ShoppingCart className="absolute right-[-10%] top-[-10%] opacity-10 w-48 h-48 -rotate-12" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
