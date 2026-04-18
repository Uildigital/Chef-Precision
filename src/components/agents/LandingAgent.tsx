"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChefHat, ChevronRight, Sparkles } from "lucide-react";

export function LandingAgent({ onStart, onDemo }: any) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[150px] rounded-full" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 bg-white/5 backdrop-blur-xl p-10 rounded-[4rem] border border-white/10 shadow-3xl mb-10">
                <ChefHat size={60} className="text-[#D4AF37] mb-6 mx-auto" />
                <h1 className="text-5xl font-black text-white leading-none tracking-tighter uppercase mb-6 italic">Chef<br/><span className="text-[#D4AF37] not-italic">Precision</span></h1>
                <p className="text-white/40 text-sm max-w-sm font-medium leading-relaxed italic mb-10">Transforme suas receitas em lucro real com inteligência artificial de custos.</p>
                <div className="flex flex-col gap-4">
                    <button onClick={onStart} className="w-full px-12 py-6 bg-[#D4AF37] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all mx-auto">Precificar Agora <ChevronRight size={16}/></button>
                    <button onClick={onDemo} className="w-full px-12 py-6 bg-white/5 text-white/40 border border-white/10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">Ver Exemplo de Ateliê <Sparkles size={14}/></button>
                </div>
            </motion.div>
        </motion.div>
    );
}
