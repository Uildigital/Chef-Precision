"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronRight, 
    ArrowLeft, 
    Minus, 
    Plus, 
    Sparkles, 
    Zap, 
    Heart, 
    DollarSign,
    Check
} from "lucide-react";
import { MathSkill } from "@/lib/logic/MathSkill";

export function PricingWizardAgent({ insumos, config, onSalvar, onVoltar }: any) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<any>({ 
        nome: '', 
        itens: [], 
        rendimento: 20, 
        margem_desejada: 3.0, 
        tempo_preparo: 0, 
        tempo_forno: 0 
    });

    const totalSteps = 4;

    const addItem = (id: string) => {
        const itemExistente = form.itens.find((it: any) => it.id_insumo === id);
        if (itemExistente) return;
        setForm({ ...form, itens: [...form.itens, { id_insumo: id, quantidade_usada: 0 }] });
    };

    const next = () => setStep(s => Math.min(s + 1, totalSteps + 1));
    const back = () => setStep(s => Math.max(s - 1, 1));

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-32">
            {/* Progresso sutil */}
            {step <= totalSteps && (
                <div className="flex gap-1 mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-[#D4AF37]" : "bg-white/5"}`} />
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* PASSO 1: Identidade */}
                {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                        <header>
                            <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-4">Qual delícia<br/>vamos calcular?</h2>
                            <p className="text-white/30 text-xs font-medium italic">Dê um nome e defina quanto essa receita rende.</p>
                        </header>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em] pl-4">Nome da Receita</label>
                                <input type="text" placeholder="Ex: Brigadeiro Belga" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full bg-white/5 border-b border-white/20 p-8 text-2xl font-black outline-none focus:border-[#D4AF37] transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] pl-4">Rendimento Vital (un/kg)</label>
                                <div className="flex items-center justify-between bg-white/5 p-4 rounded-[2rem]">
                                    <button onClick={() => setForm({...form, rendimento: Math.max(1, form.rendimento - 1)})} className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40"><Minus/></button>
                                    <span className="text-2xl font-black italic">{form.rendimento}</span>
                                    <button onClick={() => setForm({...form, rendimento: form.rendimento + 1})} className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40"><Plus/></button>
                                </div>
                            </div>
                        </div>
                        <button disabled={!form.nome} onClick={next} className="w-full h-20 bg-[#D4AF37] text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 transition-all">Próximo Passo <ChevronRight/></button>
                    </motion.div>
                )}

                {/* PASSO 2: Ingredientes */}
                {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <header>
                            <h2 className="text-3xl font-black italic tracking-tighter mb-2">Ingredientes</h2>
                            <p className="text-white/30 text-xs font-medium">Selecione o que você usou e defina a quantidade.</p>
                        </header>

                        <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-2">
                            {insumos.map((i: any) => (
                                <button key={i.id} onClick={() => addItem(i.id)} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${form.itens.find((it:any)=>it.id_insumo === i.id) ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" : "bg-white/5 border-white/5 text-white/40"}`}>
                                    <span className="text-xs font-bold uppercase">{i.name}</span>
                                    {form.itens.find((it:any)=>it.id_insumo === i.id) ? <Check size={16}/> : <Plus size={16}/>}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {form.itens.map((it: any, idx: number) => {
                                const ins = insumos.find((i:any)=>i.id === it.id_insumo);
                                return (
                                    <div key={idx} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase text-white/40">{ins?.name}</span>
                                        <div className="flex items-center gap-3">
                                            <input type="number" placeholder="Qtd" value={it.quantidade_used} onChange={e => {
                                                const novos = [...form.itens];
                                                novos[idx].quantidade_usada = parseFloat(e.target.value);
                                                setForm({...form, itens: novos});
                                            }} className="w-24 bg-black/40 border-b border-[#D4AF37]/20 p-2 text-center font-black outline-none focus:border-[#D4AF37]" />
                                            <span className="text-[10px] font-black opacity-20">{ins?.unit}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-4">
                           <button onClick={back} className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-white/20"><ArrowLeft/></button>
                           <button disabled={form.itens.length === 0} onClick={next} className="flex-1 h-20 bg-[#D4AF37] text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 transition-all">Próximo Passo <ChevronRight/></button>
                        </div>
                    </motion.div>
                )}

                {/* PASSO 3: Tempo e Esforço */}
                {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                        <header>
                            <h2 className="text-3xl font-black italic tracking-tighter mb-2">Tempo é Dinheiro</h2>
                            <p className="text-white/30 text-xs font-medium">Quanto tempo você gasta com as mãos na massa?</p>
                        </header>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em] pl-4">Produção Manual (Minutos)</label>
                                <input type="number" value={form.tempo_preparo} onChange={e => setForm({...form, tempo_preparo: parseInt(e.target.value)})} className="w-full bg-white/5 border-b border-white/20 p-8 text-4xl font-black outline-none focus:border-[#D4AF37] transition-all text-center" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] pl-4">Tempo de Forno (Minutos)</label>
                                <input type="number" value={form.tempo_forno} onChange={e => setForm({...form, tempo_forno: parseInt(e.target.value)})} className="w-full bg-white/5 border-b border-white/20 p-8 text-4xl font-black outline-none focus:border-white/40 transition-all text-center" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={back} className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-white/20"><ArrowLeft/></button>
                           <button onClick={next} className="flex-1 h-20 bg-[#D4AF37] text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all">Ver Resultado <Sparkles/></button>
                        </div>
                    </motion.div>
                )}

                {/* PASSO 4: Resultado Mágico */}
                {step === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <header className="text-center">
                            <div className="h-20 w-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap className="text-[#D4AF37]" size={32}/>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter">Cálculo Concluído!</h2>
                        </header>

                        {/* Card Elite */}
                        <div className="bg-[#D4AF37] p-10 rounded-[4rem] text-black shadow-3xl shadow-[#D4AF37]/20 relative overflow-hidden text-center">
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4 block">Sugestão de Venda</span>
                             <h3 className="text-7xl font-black italic leading-none mb-6">
                                {MathSkill.formatarMoeda(
                                    (MathSkill.calcularCustoIngredientes(form.itens, insumos) + 
                                    MathSkill.calcularCustoOperacional(form, config).laborCost + 
                                    MathSkill.calcularCustoOperacional(form, config).operationalCost) * 3
                                )}
                             </h3>
                             <div className="flex justify-center gap-2">
                                 <span className="px-5 py-2 bg-black/5 rounded-full text-[9px] font-black uppercase">Custo Unitário: {MathSkill.formatarMoeda((MathSkill.calcularCustoIngredientes(form.itens, insumos) + MathSkill.calcularCustoOperacional(form, config).laborCost + MathSkill.calcularCustoOperacional(form, config).operationalCost) / form.rendimento)}</span>
                             </div>
                             <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12"><DollarSign size={200} /></div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-6">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                 <span>Insumos</span>
                                 <span className="text-white">{MathSkill.formatarMoeda(MathSkill.calcularCustoIngredientes(form.itens, insumos))}</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                 <span>Mão de Obra</span>
                                 <span className="text-white">{MathSkill.formatarMoeda(MathSkill.calcularCustoOperacional(form, config).laborCost)}</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                 <span>Contas Fixas</span>
                                 <span className="text-white">{MathSkill.formatarMoeda(MathSkill.calcularCustoOperacional(form, config).operationalCost)}</span>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setStep(1)} className="py-6 bg-white/5 text-white/40 rounded-[2rem] font-black text-xs uppercase tracking-widest">Recalcular</button>
                            <button onClick={() => { onSalvar(form); onVoltar(); }} className="py-6 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Heart size={14} fill="currentColor"/> Salvar Ficha</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
