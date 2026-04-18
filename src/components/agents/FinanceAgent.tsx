"use client";
import React from "react";
import { ArrowLeft, Save, User, Clock, Wallet, Info } from "lucide-react";

export function FinanceAgent({ config, setConfig, user, supabase, onVoltar }: any) {
    const handleSave = async () => {
        if (!user) {
            localStorage.setItem("chef-config", JSON.stringify(config));
            alert("Salvo no navegador!"); return;
        }
        await supabase.from('user_settings').upsert({ 
            user_id: user.id, 
            salario_desejado: config.salario_desejado,
            horas_trabalhadas_mes: config.horas_trabalhadas_mes,
            contas: config.contas
        });
        alert("Configurações atualizadas!");
    };

    return (
        <div className="pb-32">
            <header className="mb-10">
                <button onClick={onVoltar} className="mb-6 h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40"><ArrowLeft size={18}/></button>
                <h2 className="text-3xl font-black italic">Configurações</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Dê a ordem financeira ao seu ateliê</p>
            </header>

            <div className="space-y-6">
                {/* Perfil Simplificado */}
                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-8">
                     <div className="flex items-center gap-4 text-[#D4AF37]">
                         <User size={20} />
                         <h3 className="text-xs font-black uppercase tracking-[0.3em]">Qual seu Pro-Labore?</h3>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] pl-2">Salário Mensal Esperado</label>
                             <div className="relative">
                                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black">R$</span>
                                 <input type="number" value={config.salario_desejado} onChange={e => setConfig({...config, salario_desejado: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/5 p-6 pl-14 rounded-2xl outline-none focus:border-[#D4AF37] font-black text-lg" />
                             </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] pl-2">Horas de Trabalho p/ Mês</label>
                             <div className="relative">
                                 <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                 <input type="number" value={config.horas_trabalhadas_mes} onChange={e => setConfig({...config, horas_trabalhadas_mes: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/5 p-6 pl-16 rounded-2xl outline-none focus:border-[#D4AF37] font-black text-lg" />
                             </div>
                        </div>
                     </div>
                     <div className="p-6 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10 flex items-center gap-4">
                         <Info size={16} className="text-[#D4AF37]" />
                         <p className="text-[10px] font-bold text-[#D4AF37]/80 uppercase tracking-widest">Seu valor/hora está em: R$ {(config.salario_desejado / config.horas_trabalhadas_mes || 0).toFixed(2)}</p>
                     </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-6">
                     <div className="flex items-center gap-4 text-white/40">
                         <Wallet size={20} />
                         <h4 className="text-xs font-black uppercase tracking-[0.3em]">Custos Fixos da Cozinha</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Energia', key: 'luz' },
                            { label: 'Gás', key: 'gas' },
                            { label: 'Água', key: 'agua' },
                            { label: 'Internet', key: 'internet' }
                        ].map(c => (
                            <div key={c.key} className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest pl-2">{c.label}</label>
                                <input type="number" value={config.contas?.[c.key] || 0} onChange={e => setConfig({...config, contas: {...(config.contas || {}), [c.key]: parseFloat(e.target.value)}})} className="w-full bg-black/40 border border-white/5 p-5 rounded-xl outline-none focus:border-white/20 font-bold" />
                            </div>
                        ))}
                     </div>
                </div>

                <button onClick={handleSave} className="w-full py-8 bg-[#D4AF37] text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[#D4AF37]/10 flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <Save size={18}/> Salvar Global
                </button>
            </div>
        </div>
    );
}
