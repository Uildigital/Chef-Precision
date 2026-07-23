"use client";

import { motion } from "framer-motion";
import { ChefHat, ArrowRight, CheckCircle2, TrendingUp, Calculator, PieChart, Star } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  // TODO: O usuário deve substituir este link pelo link real do checkout da Kiwify
  const KIWIFY_CHECKOUT_URL = "#"; 

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <ChefHat className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            Precifica Chef
          </span>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-neutral-400 hover:text-white px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
          Entrar no Sistema
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 relative max-w-5xl mx-auto flex flex-col items-center text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 blur-[120px] pointer-events-none rounded-full -z-10" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-widest uppercase mb-6">
            O Fim do Prejuízo na Confeitaria
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Descubra o Lucro Exato de <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Cada Receita em Segundos.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            O primeiro software de gestão feito para confeiteiras. Calcule ingredientes, gás, aluguel e margem de lucro de forma automática, tudo pelo celular.
          </p>

          <a href={KIWIFY_CHECKOUT_URL} className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-lg px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20">
            Quero Lucrar Mais Agora <ArrowRight size={20} />
          </a>
          <p className="mt-4 text-xs text-neutral-500 flex items-center justify-center gap-1">
            <CheckCircle2 size={12} className="text-green-500"/> Acesso Vitalício. Pagamento Único.
          </p>
        </motion.div>
      </section>

      {/* SOCIAL PROOF / BENEFITS */}
      <section className="py-20 px-6 bg-black/50 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl">
            <div className="bg-amber-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Calculator className="text-amber-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Custos Invisíveis</h3>
            <p className="text-neutral-400 text-sm">O sistema calcula o quanto você gasta de gás, luz e aluguel em cada bolo. Nunca mais pague para trabalhar.</p>
          </div>
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl">
            <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Escala Automática</h3>
            <p className="text-neutral-400 text-sm">Recebeu uma encomenda de 500 docinhos? Digite "500" e o sistema recalcula toda a lista de compras na hora.</p>
          </div>
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl">
            <div className="bg-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <PieChart className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lucro Previsível</h3>
            <p className="text-neutral-400 text-sm">Veja exatamente qual é a sua margem de lucro por porção. Defina seu salário e bata suas metas financeiras.</p>
          </div>
        </div>
      </section>

      {/* BONUS SECTION */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-orange-500/5 blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-neutral-900 to-black border border-amber-500/30 rounded-[3rem] p-8 md:p-12 text-center relative shadow-2xl shadow-amber-500/10">
          
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full shadow-lg whitespace-nowrap">
            🎁 Bônus Exclusivo de Lançamento
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-6 mt-6">
            E-book Premium:<br/> <span className="text-amber-500">Receitas Juninas</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
            Comprando o sistema hoje, você leva totalmente de graça o nosso aclamado livro digital com as receitas mais lucrativas da época junina. Perfeito para você já estrear a calculadora faturando!
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="bg-black/50 border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[200px]">
              <span className="text-neutral-500 line-through text-sm">Valor Normal: R$ 97,00</span>
              <span className="text-2xl font-black text-white">HOJE: R$ 47,00</span>
            </div>
          </div>

          <a href={KIWIFY_CHECKOUT_URL} className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-lg px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20 w-full md:w-auto justify-center">
            Garantir Sistema + Bônus <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 text-center text-neutral-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ChefHat size={20} className="text-neutral-600" />
          <span className="font-bold text-neutral-400">Precifica Chef</span>
        </div>
        <p>© 2026 Precifica Chef. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Esta ferramenta é um SaaS desenvolvido para empreendedores culinários.</p>
      </footer>
    </div>
  );
}
