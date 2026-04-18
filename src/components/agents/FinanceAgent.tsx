"use client";
import React from "react";
import { Zap } from "lucide-react";

export function FinanceAgent({ config, setConfig, user, supabase }: any) {
    const handleSave = async () => {
        if (!user) {
            localStorage.setItem("chef-config", JSON.stringify(config));
            alert("Salvo no navegador!"); return;
        }
        await supabase.from('user_settings').upsert({ 
            user_id: user.id, 
            mao_de_obra: config.mao_de_obra,
            taxa_fixa: config.taxa_fixa,
            salario_desejado: config.salario_desejado,
            horas_trabalhadas_mes: config.horas_trabalhadas_mes,
            contas: config.contas
        });
        alert("Sincronizado na Nuvem!");
    };

    return (
        <div className="p-10 max-w-2xl mx-auto py-24">
            <h2 className="text-4xl font-black tracking-tighter mb-12 italic text-center">Configurações Master</h2>
            
            <div className="grid gap-8">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-black/5 space-y-8">
                    <h3 className="text-xs font-black uppercase text-[#D4AF37] tracking-[0.3em]">Definição de Pro-Labore</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Salário Desejado (R$)</label>
                            <input type="number" value={config.salario_desejado} onChange={e => setConfig({...config, salario_desejado: parseFloat(e.target.value)})} className="bg-[#F5F5F5] p-6 rounded-2xl outline-none font-black text-sm" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Horas de Trabalho / Mês</label>
                            <input type="number" value={config.horas_trabalhadas_mes} onChange={e => setConfig({...config, horas_trabalhadas_mes: parseFloat(e.target.value)})} className="bg-[#F5F5F5] p-6 rounded-2xl outline-none font-black text-sm" />
                        </div>
                    </div>
                    <div className="p-6 bg-[#D4AF37]/5 rounded-2xl">
                        <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Seu valor/hora atual: R$ {(config.salario_desejado / config.horas_trabalhadas_mes || 0).toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-black/5 space-y-8">
                    <h3 className="text-xs font-black uppercase text-[#D4AF37] tracking-[0.3em]">Custos Fixos Mensais</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Energia Elétrica</label>
                            <input type="number" value={config.contas?.luz || 0} onChange={e => setConfig({...config, contas: {...(config.contas || {}), luz: parseFloat(e.target.value)}})} className="bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Gás de Cozinha</label>
                            <input type="number" value={config.contas?.gas || 0} onChange={e => setConfig({...config, contas: {...(config.contas || {}), gas: parseFloat(e.target.value)}})} className="bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Água</label>
                            <input type="number" value={config.contas?.agua || 0} onChange={e => setConfig({...config, contas: {...(config.contas || {}), agua: parseFloat(e.target.value)}})} className="bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Internet/Tel</label>
                            <input type="number" value={config.contas?.internet || 0} onChange={e => setConfig({...config, contas: {...(config.contas || {}), internet: parseFloat(e.target.value)}})} className="bg-[#F5F5F5] p-5 rounded-2xl outline-none font-black text-sm" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-black/5 space-y-8">
                    <div className="flex flex-col gap-2 text-left">
                        <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] pl-2">Margem de Erro/Extra (%)</label>
                        <input type="number" value={config.taxa_fixa} onChange={e => setConfig({...config, taxa_fixa: parseFloat(e.target.value)})} className="bg-[#F5F5F5] p-6 rounded-2xl outline-none font-black text-sm" />
                    </div>
                    <button onClick={handleSave} className="w-full py-6 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                        <Zap size={16} className="text-[#D4AF37]"/> Salvar Preferências
                    </button>
                </div>
            </div>
        </div>
    );
}
