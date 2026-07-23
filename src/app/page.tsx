"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, ArrowRight, CheckCircle2, TrendingUp, Calculator, PieChart, ShieldCheck, XCircle, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function VSLSalesPage() {
  const KIWIFY_CHECKOUT_URL = "#"; // COLOQUE O LINK DE CHECKOUT AQUI
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostra o botão flutuante depois de descer 500px (quando passa a Hero)
      setShowSticky(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-50 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden pb-24 md:pb-0">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070707]/90 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
            <ChefHat className="text-white" size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            Precifica Chef
          </span>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-neutral-400 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
          Já sou aluno (Entrar)
        </Link>
      </nav>

      {/* 1. HERO & VSL SECTION */}
      <section className="pt-28 pb-16 px-6 relative max-w-4xl mx-auto flex flex-col items-center text-center z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full -z-10" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-widest uppercase mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> ATENÇÃO CONFEITEIRAS
          </span>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
            Descubra o Lucro Exato de Cada Receita e <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 underline decoration-amber-500/30 underline-offset-8">Pare de Pagar Para Trabalhar.</span>
          </h1>
          <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
            O único sistema inteligente do Brasil que calcula ingredientes, gás, aluguel e a sua margem de lucro em menos de 1 minuto pelo celular.
          </p>

          {/* VSL PLACEHOLDER (Espaço para o Vídeo) */}
          <div className="w-full max-w-3xl aspect-video bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl mb-10 group cursor-pointer hover:border-amber-500/50 transition-colors flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745a8e0f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700"></div>
            <PlayCircle size={80} className="text-amber-500 mb-4 z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <p className="z-10 font-bold text-white tracking-widest uppercase text-sm">Assista ao Vídeo Acima</p>
          </div>

          <a href={KIWIFY_CHECKOUT_URL} className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xl px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20 w-full md:w-auto">
            Quero Acessar o Sistema <ArrowRight size={24} />
          </a>
          <p className="mt-4 text-xs text-neutral-500">
            Liberação imediata no seu e-mail após a compra.
          </p>
        </motion.div>
      </section>

      {/* 2. PAIN SECTION (Isso soa familiar?) */}
      <section className="py-20 px-6 bg-[#0a0a0a] border-y border-white/5 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Me responda com sinceridade... <br/><span className="text-amber-500">Isso acontece com você?</span></h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Trabalha o fim de semana inteiro e na segunda-feira o dinheiro some.",
              "Tem medo de cobrar o preço justo e os clientes acharem 'careiro'.",
              "Não faz ideia de quanto gasta de gás, energia e detergente num bolo.",
              "Recebeu uma encomenda enorme e travou na hora de calcular as medidas."
            ].map((pain, i) => (
              <div key={i} className="flex gap-4 items-start bg-neutral-900/50 border border-red-500/10 p-6 rounded-2xl">
                <XCircle className="text-red-500 shrink-0 mt-1" />
                <p className="text-neutral-300 font-medium">{pain}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-400 mt-12 max-w-2xl mx-auto">
            Se você marcou "Sim" para qualquer uma das opções, o problema não está no seu produto (seus doces são ótimos). <strong className="text-white">O problema está na precificação "de olho".</strong> O Precifica Chef foi criado para acabar com isso hoje.
          </p>
        </div>
      </section>

      {/* 3. BENEFITS (Como Funciona) */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Um verdadeiro "Gerente Financeiro" <br/>na palma da sua mão.</h2>
          <p className="text-neutral-400">Esqueça o Excel. Nosso sistema faz o trabalho sujo por você.</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl hover:border-amber-500/30 transition-colors">
            <div className="bg-amber-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Calculator className="text-amber-500" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Custos Ocultos Revelados</h3>
            <p className="text-neutral-400">Ele embute no preço do doce a sua conta de luz, o aluguel e até a embalagem de entrega. Você nunca mais pagará para trabalhar.</p>
          </div>
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl hover:border-orange-500/30 transition-colors">
            <div className="bg-orange-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="text-orange-500" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Modo Escala Automático</h3>
            <p className="text-neutral-400">Vai fazer 1.000 brigadeiros em vez de 50? Digite "1000" e o sistema recalcula toda a lista de compras no mercado de forma instantânea.</p>
          </div>
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl hover:border-green-500/30 transition-colors">
            <div className="bg-green-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <PieChart className="text-green-500" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Proteção de Salário</h3>
            <p className="text-neutral-400">Defina o salário que você quer tirar no mês, e a ferramenta vai dizer exatamente qual a porcentagem adicionar em cada receita para bater a meta.</p>
          </div>
        </div>
      </section>

      {/* 3.5. PROVA SOCIAL (Depoimentos) */}
      <section className="py-20 px-6 bg-[#0a0a0a] border-y border-white/5 relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Quem testou, <span className="text-amber-500">não vive mais sem.</span></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Mariana S.", desc: "Confeiteira Autônoma", text: "Eu achava que lucrava vendendo bolo de pote a 7 reais. Quando coloquei na calculadora, vi que meu custo era 6,80. Salvaram meu negócio!" },
              { name: "Juliana", desc: "Dona de Doceria", text: "Nunca vi nada tão fácil de usar. Eu odeio planilhas e aquele monte de células. Esse aplicativo é lindo e me dá a lista de compras pronta." },
              { name: "Carla T.", desc: "Especialista em Bolos", text: "O melhor de tudo foi colocar a minha meta salarial lá. Agora eu sei exatamente o quanto preciso adicionar em cada fatia para pagar meu salário." }
            ].map((dep, i) => (
              <div key={i} className="bg-neutral-900 border border-white/5 p-8 rounded-3xl relative">
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                </div>
                <p className="text-neutral-300 italic mb-6">"{dep.text}"</p>
                <div>
                  <p className="font-bold text-white">{dep.name}</p>
                  <p className="text-xs text-neutral-500">{dep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. OFFER & STACKING (Bônus) */}
      <section className="py-24 px-6 relative overflow-hidden bg-black border-y border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-orange-500/5 blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-4xl mx-auto bg-neutral-900 border border-amber-500/30 rounded-[3rem] p-8 md:p-14 text-center relative shadow-2xl shadow-amber-500/10">
          
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full shadow-lg whitespace-nowrap">
            🎁 Bônus Exclusivo de Lançamento
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-6 mt-6">
            Compre Hoje e Leve: <br/> <span className="text-amber-500">O E-book Receitas Juninas de Ouro</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
            Além do software completo vitalício, você ganhará acesso imediato ao nosso E-book fechado com as receitas que mais geram lucro na sazonalidade. Só esse e-book custa R$ 97, mas hoje é seu de graça.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="bg-black/80 border border-white/10 px-8 py-6 rounded-3xl flex flex-col items-center">
              <p className="text-neutral-400 font-medium mb-2">Resumo da sua Oferta:</p>
              <ul className="text-left text-sm text-neutral-300 space-y-2 mb-4">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Sistema Precifica Chef <span className="text-neutral-500 line-through ml-auto">R$ 147,00</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> E-book Receitas Juninas <span className="text-neutral-500 line-through ml-auto">R$ 97,00</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Atualizações Futuras <span className="text-neutral-500 line-through ml-auto">Inestimável</span></li>
              </ul>
              <div className="border-t border-white/10 w-full pt-4 mt-2">
                <p className="text-neutral-500 line-through text-sm">Valor Total: R$ 244,00</p>
                <p className="text-3xl font-black text-white mt-1">Apenas R$ 47,00 <span className="text-sm font-normal text-neutral-400">à vista</span></p>
              </div>
            </div>
          </div>

          <a href={KIWIFY_CHECKOUT_URL} className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xl px-12 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20 w-full md:w-auto justify-center">
            Sim, Quero a Calculadora + Bônus <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* 5. GUARANTEE */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left bg-neutral-900 border border-white/5 p-8 md:p-10 rounded-[2rem]">
          <div className="bg-amber-500/10 p-6 rounded-full shrink-0">
            <ShieldCheck size={64} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black mb-3">Risco Zero: 7 Dias de Garantia</h3>
            <p className="text-neutral-400">
              Estamos tão confiantes de que o Precifica Chef vai revolucionar o financeiro do seu negócio que assumimos todo o risco. Compre agora, use o sistema. Se em até 7 dias você achar que ele não facilita a sua vida, devolvemos 100% do seu dinheiro com apenas um clique.
            </p>
          </div>
        </div>
      </section>

      {/* 5.5. AUTOR (Quem Sou Eu) */}
      <section className="py-20 px-6 bg-black border-y border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-neutral-900 border-4 border-amber-500/20 shrink-0 overflow-hidden relative">
             {/* Você pode trocar essa div por uma tag <img /> com a sua foto! */}
             <div className="absolute inset-0 flex items-center justify-center text-neutral-700 text-center text-xs p-4">
                [Sua Foto Aqui]
             </div>
          </div>
          <div>
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-2 block">Muito Prazer, Eu Sou...</span>
            <h2 className="text-3xl font-black mb-4">Uilton (O Criador)</h2>
            <p className="text-neutral-400 mb-4">
              Por muitos anos, eu vi de perto a dor de quem trabalha com gastronomia. A paixão por criar receitas incríveis quase sempre esbarra na dificuldade financeira.
            </p>
            <p className="text-neutral-400">
              O Precifica Chef não é apenas um "aplicativo". É a ferramenta que eu criei para que <strong>ninguém mais precise fechar as portas por não saber precificar</strong>. Eu simplifiquei o que era complexo para que você possa focar no que faz de melhor: cozinhar e encantar.
            </p>
          </div>
        </div>
      </section>

      {/* 5.6. FAQ (Perguntas Frequentes) */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              { q: "Eu preciso baixar algum aplicativo no celular?", a: "Não! O Precifica Chef é um aplicativo web (SaaS). Você acessa pelo navegador do seu celular ou computador, como se fosse um site, usando seu e-mail e senha." },
              { q: "Tem alguma mensalidade oculta?", a: "Nenhuma. Essa é uma oferta especial de lançamento vitalício. Você paga R$ 47,00 uma única vez e tem acesso ao sistema para sempre." },
              { q: "Sou péssima com tecnologia. Vou conseguir usar?", a: "Com certeza. Nós abolimos as planilhas feias. O sistema foi desenhado para ser tão fácil de usar quanto o seu Instagram." },
              { q: "Como eu recebo o acesso?", a: "Assim que o pagamento for aprovado (via Pix ou Cartão), o acesso ao sistema e ao Bônus é enviado imediatamente para o seu e-mail." }
            ].map((faq, i) => (
              <div key={i} className="bg-neutral-900 border border-white/5 p-6 rounded-2xl">
                <h4 className="font-bold text-lg mb-2 text-white flex items-center gap-2"><CheckCircle2 size={18} className="text-amber-500"/> {faq.q}</h4>
                <p className="text-neutral-400 text-sm ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER & DISCLAIMER */}
      <footer className="border-t border-white/5 py-16 px-6 text-center text-neutral-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ChefHat size={20} className="text-neutral-600" />
          <span className="font-bold text-neutral-400">Precifica Chef</span>
        </div>
        <p>© 2026 Precifica Chef. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs max-w-2xl mx-auto text-neutral-600">
          <strong>Aviso Legal (Disclaimer):</strong> Este site não faz parte do site do Facebook, Instagram, Google ou da Meta Platforms, Inc. Além disso, este site NÃO é endossado pelo Facebook ou Google de nenhuma maneira. FACEBOOK e GOOGLE são marcas comerciais independentes. Os resultados podem variar de pessoa para pessoa, a ferramenta serve como um sistema auxiliar de gestão.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs">
          <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
          <a href="#" className="hover:text-white transition-colors">Contato</a>
        </div>
      </footer>

      {/* 6. STICKY CTA (Botão Flutuante Mobile) */}
      <AnimatePresence>
        {showSticky && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-50 bg-gradient-to-t from-black via-black/80 to-transparent pb-6"
          >
            <a href={KIWIFY_CHECKOUT_URL} className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-lg w-full py-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Comprar por R$ 47 <ArrowRight size={20} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
