"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

export function InventoryAgent({ insumos, onAdicionar, onExcluir }: any) {
    const [isAdd, setIsAdd] = useState(false);
    const [form, setForm] = useState({ name: '', price: 0, quantity: 1, unit: 'g', yield_percentage: 100 });

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-3xl mx-auto pb-32">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black tracking-tighter">Gestor de Insumos</h2>
                <button onClick={() => setIsAdd(true)} className="h-14 w-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Plus/></button>
            </div>

            <AnimatePresence>
                {isAdd && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-black/5 space-y-6">
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Nome do Produto</label><input type="text" placeholder="Leite Condensado 395g" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Preço Pago (R$)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm" /></div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Unidade de Compra</label>
                                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm">
                                    <option value="g">Gramas (g)</option>
                                    <option value="kg">Quilos (kg)</option>
                                    <option value="ml">Mililitros (ml)</option>
                                    <option value="L">Litros (L)</option>
                                    <option value="un">Unidade (un)</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Qtd da Embalagem</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm" /></div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-black/40 tracking-widest pl-2">Aproveitamento (%)</label>
                                <input type="number" value={form.yield_percentage} onChange={e => setForm({...form, yield_percentage: parseFloat(e.target.value)})} className="w-full bg-[#F5F5F5] p-5 rounded-2xl outline-none font-bold text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setIsAdd(false)} className="py-5 bg-[#F5F5F5] text-black/40 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                            <button onClick={() => { onAdicionar(form); setIsAdd(false); setForm({ name: '', price: 0, quantity: 1, unit: 'g', yield_percentage: 100 }); }} className="py-5 bg-[#D4AF37] text-white font-black text-[10px] uppercase rounded-2xl shadow-xl">Cadastrar Insumo</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {insumos.map((i: any) => (
                    <div key={i.id} className="bg-white p-5 rounded-[2rem] shadow-md flex items-center justify-between group border border-transparent hover:border-[#D4AF37]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-xs font-black uppercase text-black/40">{i.unit}</div>
                            <div><h4 className="font-extrabold text-sm">{i.name}</h4><p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">R$ {i.price.toFixed(2)} por {i.quantity}{i.unit}</p></div>
                        </div>
                        <button onClick={() => onExcluir(i.id)} className="h-10 w-10 text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
