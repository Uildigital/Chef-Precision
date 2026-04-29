"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, ArrowLeft, Tag } from "lucide-react";

export function InventoryAgent({ insumos, onAdicionar, onExcluir, onVoltar }: any) {
    const [isAdding, setIsAdding] = useState(false);
    const [busca, setBusca] = useState('');
    const [form, setForm] = useState({ name: '', price: 0, quantity: 1, unit: 'g' });

    const insumosFiltrados = insumos.filter((i: any) =>
        i.name.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32">
            <header className="mb-10">
                <button onClick={onVoltar} className="mb-6 h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40"><ArrowLeft size={18}/></button>
                <h2 className="text-3xl font-black italic">Seu Estoque</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">{insumos.length} ingredientes cadastrados</p>
            </header>

            <AnimatePresence>
                {!isAdding ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="relative mb-6">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
                            <input type="text" placeholder="Buscar ingrediente..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-2xl outline-none focus:border-[#D4AF37]/50 transition-all font-medium" />
                        </div>
                        
                        <div className="grid gap-3">
                            {insumosFiltrados.map((i: any) => (
                                <div key={i.id} className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] text-xs font-black uppercase">{i.unit}</div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{i.name}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">R$ {i.price.toFixed(2)} / {i.quantity}{i.unit}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onExcluir(i.id)} className="h-10 w-10 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => setIsAdding(true)} className="fixed bottom-32 right-8 h-16 w-16 bg-[#D4AF37] text-black shadow-2xl shadow-[#D4AF37]/20 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-20"><Plus/></button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-8">
                        <div className="flex items-center gap-2 text-[#D4AF37]">
                            <Tag size={18} />
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Novo Insumo</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-2">Nome</label>
                                <input type="text" placeholder="Ex: Chocolate Callebaut" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl outline-none focus:border-[#D4AF37] font-bold text-sm transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-2">Preço (R$)</label>
                                    <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl outline-none focus:border-[#D4AF37] font-bold text-sm transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-2">Unidade</label>
                                    <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl outline-none focus:border-[#D4AF37] font-bold text-sm transition-all appearance-none">
                                        <option value="g">Gramas (g)</option>
                                        <option value="kg">Quilos (kg)</option>
                                        <option value="ml">Mililitros (ml)</option>
                                        <option value="L">Litros (L)</option>
                                        <option value="un">Unidade (un)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-white/5 text-white/20 font-black text-[10px] uppercase tracking-widest rounded-2xl">Cancelar</button>
                            <button onClick={() => { onAdicionar(form); setIsAdding(false); }} className="flex-[2] py-5 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl">Salvar Ingrediente</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
