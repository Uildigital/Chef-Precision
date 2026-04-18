"use client";
import React, { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";

export function ProductionAgent({ receitas, insumos }: any) {
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
            
            const fator = prod.quantidade / rec.rendimento;
            
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
        <div className="p-6 max-w-4xl mx-auto pb-32">
            <h2 className="text-3xl font-black tracking-tighter mb-8 italic">Planejamento de Produção</h2>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-black/5 mb-10 space-y-6">
                <h3 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em]">O que você vai produzir?</h3>
                <div className="flex gap-4">
                    <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="flex-1 bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-xs">
                        <option value="">Selecione uma receita...</option>
                        {receitas.map((r: any) => <option key={r.id} value={r.id}>{r.nome}</option>)}
                    </select>
                    <input type="number" placeholder="Qtd" value={selectedQt} onChange={e => setSelectedQt(parseFloat(e.target.value))} className="w-32 bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-xs" />
                    <button onClick={addNaLista} className="h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all"><Plus/></button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {listaProducao.map((p, idx) => (
                        <div key={idx} className="bg-[#1A1A1A] text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-3">
                            {receitas.find((r:any)=>r.id === p.id_receita)?.nome} ({p.quantidade})
                            <button onClick={() => setListaProducao(listaProducao.filter((_, i) => i !== idx))}><X size={12}/></button>
                        </div>
                    ))}
                </div>
            </div>

            {consolidado.length > 0 && (
                <div className="bg-[#D4AF37] p-10 rounded-[4rem] text-white shadow-3xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 opacity-60">Lista de Compras Consolidada</h3>
                    <div className="grid gap-4">
                        {consolidado.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-white/20 pb-4">
                                <span className="font-bold text-lg">{item.name}</span>
                                <span className="font-black text-xl">{item.total.toLocaleString('pt-BR')} {item.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
