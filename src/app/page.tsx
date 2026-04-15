"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  ChefHat, 
  ChevronRight, 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  Settings,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  FileText,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface Ingredient {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: 'g' | 'ml' | 'un';
}

interface RecipeIngredient {
  ingredientId: string;
  amount: number;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  fixedCosts: number;
  markup: number;
}

export default function ChefPrecision() {
  const [activeTab, setActiveTab] = useState<'info' | 'dashboard' | 'insumos' | 'receitas' | 'settings'>('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLogged, setIsLogged] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const savedIng = localStorage.getItem("chef-ingredients");
    if (savedIng) setIngredients(JSON.parse(savedIng));

    const savedRec = localStorage.getItem("chef-recipes");
    if (savedRec) setRecipes(JSON.parse(savedRec));
  }, []);

  // Save on Change
  useEffect(() => {
    localStorage.setItem("chef-ingredients", JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem("chef-recipes", JSON.stringify(recipes));
  }, [recipes]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1A1A2E]">
      {/* Sidebar Mobile Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-y-0 left-0 w-72 bg-primary text-white z-[60] p-8 flex flex-col shadow-2xl">
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3"><ChefHat size={32} className="text-secondary" /><span className="font-black text-xl tracking-tighter italic">Chef<span className="text-secondary">Precision</span></span></div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/10 rounded-xl"><X size={20}/></button>
             </div>
             
             <nav className="flex-1 space-y-2">
                {[
                  { id: 'dashboard', label: 'Monitoramento', icon: LayoutDashboard },
                  { id: 'insumos', label: 'Insumos / Preços', icon: Package },
                  { id: 'receitas', label: 'Engenharia / Receitas', icon: BookOpen },
                  { id: 'settings', label: 'Custos Fixos', icon: Settings }
                ].map((item) => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? "bg-secondary text-white shadow-lg" : "text-white/40 hover:text-white"}`}>
                    <item.icon size={20} />
                    <span className="text-[10px] uppercase font-black tracking-widest">{item.label}</span>
                  </button>
                ))}
             </nav>

             <div className="mt-auto pt-8 border-t border-white/5 opacity-40 text-center"><span className="text-[9px] font-bold uppercase tracking-widest">v1.0 Elite Version</span></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
          <header className={`px-6 py-6 flex items-center justify-between bg-white border-b border-primary/5 sticky top-0 z-50 ${activeTab === 'info' ? "hidden" : "flex"}`}>
            <button onClick={() => setIsSidebarOpen(true)} className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-sm"><Menu size={20}/></button>
            <div className="text-center flex flex-col items-center">
               <span className="text-[9px] font-black uppercase text-secondary tracking-[0.4em] mb-0.5">Dashboard Expert</span>
               <div className="h-0.5 w-8 bg-secondary rounded-full" />
            </div>
            <div className="flex items-center gap-2">
                {!isLogged && (
                    <button className="px-4 py-2 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2">
                       <DollarSign size={10} className="text-secondary" /> Sincronizar Nuvem
                    </button>
                )}
                <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-black text-xs border border-secondary/10">JD</div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
             <AnimatePresence mode="wait">
                {activeTab === 'info' && <LandingView onStart={() => setActiveTab('dashboard')} />}
                {activeTab === 'dashboard' && <OverviewTab ingredients={ingredients} recipes={recipes} onNavigate={(tab: any) => setActiveTab(tab)} />}
                {activeTab === 'insumos' && <InsumosTab ingredients={ingredients} setIngredients={setIngredients} />}
                {activeTab === 'receitas' && <ReceitasTab ingredients={ingredients} recipes={recipes} setRecipes={setRecipes} />}
                {activeTab === 'settings' && <SettingsTab />}
             </AnimatePresence>
          </main>
      </div>
    </div>
  );
}

// --- Views & Components ---

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/10 blur-[150px] rounded-full" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-2xl">
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="p-5 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl"><ChefHat size={48} className="text-secondary" /></div>
            </div>
            <h1 className="text-6xl font-black mb-8 leading-[0.9] tracking-tighter">PRECIFIQUE COMO UM <br/><span className="text-secondary italic">ELITE CHEF.</span></h1>
            <p className="text-white/60 text-lg font-medium leading-relaxed mb-12 max-w-lg mx-auto italic">Pare de chutar preços. Tenha o controle total dos seus lucros com a ferramenta de engenharia culinária mais avançada do mercado.</p>
            <button onClick={onStart} className="px-12 py-6 bg-secondary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">ABRIR MEU ATELIÊ <ChevronRight size={18}/></button>
            <div className="mt-16 flex items-center justify-center gap-12 text-white/20">
               <div className="flex flex-col items-center"><Calculator size={24}/><span className="text-[8px] font-black mt-2 uppercase tracking-widest">ROI Real</span></div>
               <div className="flex flex-col items-center"><Package size={24}/><span className="text-[8px] font-black mt-2 uppercase tracking-widest">Gestão Estoque</span></div>
               <div className="flex flex-col items-center"><FileText size={24}/><span className="text-[8px] font-black mt-2 uppercase tracking-widest">PDF Expert</span></div>
            </div>
        </motion.div>
    </div>
  );
}

function OverviewTab({ ingredients, recipes, onNavigate }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-4xl mx-auto pb-32">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-primary/5 flex flex-col justify-between h-48 group hover:bg-primary transition-all duration-500">
             <div className="h-12 w-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-white/10 group-hover:text-white"><Package size={24} /></div>
             <div className="mt-4">
                <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest group-hover:text-white/40 block mb-1">Insumos Salvos</span>
                <p className="text-4xl font-black text-primary group-hover:text-white">{ingredients.length}</p>
             </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-primary/5 flex flex-col justify-between h-48 group hover:bg-secondary transition-all duration-500">
             <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-white/10 group-hover:text-white"><BookOpen size={24} /></div>
             <div className="mt-4">
                <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest group-hover:text-white/40 block mb-1">Engenharias (Receitas)</span>
                <p className="text-4xl font-black text-primary group-hover:text-white">{recipes.length}</p>
             </div>
          </div>
          <div className="bg-primary text-white p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between h-48 overflow-hidden relative">
             <div className="relative z-10">
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-secondary"><TrendingUp size={24} /></div>
                <div className="mt-4">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Potencial de Lucro</span>
                    <p className="text-3xl font-black text-secondary">Aumentando...</p>
                </div>
             </div>
             <div className="absolute right-[-10%] bottom-[-10%] opacity-10"><Calculator size={120} /></div>
          </div>
       </div>

       <div className="space-y-6">
          <h2 className="text-xl font-black text-primary uppercase tracking-[0.2em] mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => onNavigate('receitas')} className="p-6 bg-white border border-primary/5 rounded-[2.5rem] shadow-xl text-left flex items-center justify-between group hover:border-secondary/20 transition-all">
                <div className="flex items-center gap-5">
                   <div className="h-14 w-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><Plus size={28} /></div>
                   <div>
                      <h4 className="font-black text-primary text-sm uppercase tracking-widest leading-none">Nova Engenharia</h4>
                      <p className="text-[9px] text-primary/40 font-bold uppercase mt-1">Criar ficha técnica</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-primary/10 group-hover:text-secondary group-hover:translate-x-1" />
             </button>
             <button onClick={() => onNavigate('insumos')} className="p-6 bg-white border border-primary/5 rounded-[2.5rem] shadow-xl text-left flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-5">
                   <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary"><DollarSign size={28} /></div>
                   <div>
                      <h4 className="font-black text-primary text-sm uppercase tracking-widest leading-none">Atualizar Preços</h4>
                      <p className="text-[9px] text-primary/40 font-bold uppercase mt-1">Alterar custo global</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-primary/10 group-hover:text-primary group-hover:translate-x-1" />
             </button>
          </div>
       </div>
    </motion.div>
  );
}

function InsumosTab({ ingredients, setIngredients }: any) {
    const [isAdding, setIsAdding] = useState(false);
    const [newIng, setNewIng] = useState<Omit<Ingredient, 'id'>>({ name: '', price: 0, quantity: 1000, unit: 'g' });

    const addIngredient = () => {
        if (!newIng.name) return;
        setIngredients([...ingredients, { ...newIng, id: Date.now().toString() }]);
        setNewIng({ name: '', price: 0, quantity: 1000, unit: 'g' });
        setIsAdding(false);
    };

    const removeIngredient = (id: string) => {
        setIngredients(ingredients.filter((i: any) => i.id !== id));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl mx-auto pb-32">
            <header className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black text-primary tracking-tight">Insumos</h2>
                <button onClick={() => setIsAdding(true)} className="h-14 w-14 bg-secondary text-white rounded-2xl shadow-xl shadow-secondary/20 flex items-center justify-center active:scale-95 transition-all"><Plus size={24}/></button>
            </header>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-12">
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-2 border-secondary/20 space-y-6">
                            <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-primary/40 mb-2 pl-2">Ingrediente (ex: Chocolate Belga)</span><input type="text" value={newIng.name} onChange={(e) => setNewIng({...newIng, name: e.target.value})} className="bg-primary/5 p-5 rounded-2xl border border-primary/5 outline-none font-black text-sm text-primary" placeholder="Nome do item..." /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-primary/40 mb-2 pl-2">Preço Pago (R$)</span><input type="number" value={newIng.price} onChange={(e) => setNewIng({...newIng, price: parseFloat(e.target.value)})} className="bg-primary/5 p-5 rounded-2xl border border-primary/5 outline-none font-black text-sm text-primary" /></div>
                                <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-primary/40 mb-2 pl-2">Volume Total</span><input type="number" value={newIng.quantity} onChange={(e) => setNewIng({...newIng, quantity: parseFloat(e.target.value)})} className="bg-primary/5 p-5 rounded-2xl border border-primary/5 outline-none font-black text-sm text-primary" /></div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-primary/5 font-black text-[10px] text-primary uppercase rounded-2xl">Cancelar</button>
                                <button onClick={addIngredient} className="flex-1 py-5 bg-secondary font-black text-[10px] text-white uppercase rounded-2xl shadow-xl shadow-secondary/20">Salvar Item</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {ingredients.map((ing: Ingredient) => (
                    <div key={ing.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-primary/5 flex items-center justify-between group">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black uppercase text-[10px]">{ing.unit}</div>
                            <div>
                                <h4 className="font-black text-primary text-sm uppercase tracking-tight">{ing.name}</h4>
                                <p className="text-[10px] text-primary/40 font-bold">R$ {ing.price.toFixed(2)} por {ing.quantity}{ing.unit}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right"><span className="text-[9px] font-black uppercase text-primary/20 block">Custo por Unidade</span><span className="text-sm font-black text-primary">R$ {(ing.price / ing.quantity).toFixed(4)}</span></div>
                           <button onClick={() => removeIngredient(ing.id)} className="h-10 w-10 bg-accent/5 rounded-xl flex items-center justify-center text-accent/20 hover:text-accent hover:bg-accent/10 transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {ingredients.length === 0 && (
                    <div className="py-20 text-center text-primary/20 flex flex-col items-center"><Package size={40} className="mb-4 opacity-10" /> <span className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhum insumo cadastrado</span></div>
                )}
            </div>
        </motion.div>
    );
}

function ReceitasTab({ ingredients, recipes, setRecipes }: any) {
    const [isCreating, setIsCreating] = useState(false);
    const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({ name: '', ingredients: [], markup: 3, fixedCosts: 0 });
    const [selectedIngId, setSelectedIngId] = useState("");
    const [selectedAmount, setSelectedAmount] = useState(0);

    const addIngredientToRecipe = () => {
        if (!selectedIngId || selectedAmount <= 0) return;
        setNewRecipe({
            ...newRecipe,
            ingredients: [...(newRecipe.ingredients || []), { ingredientId: selectedIngId, amount: selectedAmount }]
        });
        setSelectedIngId("");
        setSelectedAmount(0);
    };

    const saveRecipe = () => {
        if (!newRecipe.name || (newRecipe.ingredients?.length ?? 0) === 0) return;
        setRecipes([...recipes, { ...newRecipe, id: Date.now().toString() }]);
        setNewRecipe({ name: '', ingredients: [], markup: 3, fixedCosts: 10 });
        setIsCreating(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl mx-auto pb-32">
             <header className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black text-primary tracking-tight">Engenharias</h2>
                <button onClick={() => setIsCreating(true)} className="h-14 w-14 bg-secondary text-white rounded-2xl shadow-xl shadow-secondary/20 flex items-center justify-center active:scale-95 transition-all"><Plus size={24}/></button>
            </header>

            <AnimatePresence>
                {isCreating && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-12 bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-primary/5 space-y-10 relative overflow-hidden">
                        <section className="space-y-4">
                           <h3 className="text-xl font-black text-primary uppercase tracking-widest pl-2 border-l-4 border-secondary leading-none">Dados Básicos</h3>
                           <input type="text" placeholder="Nome da Preparação..." value={newRecipe.name} onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})} className="w-full bg-primary/5 p-6 rounded-2xl border border-primary/5 outline-none font-black text-sm" />
                        </section>

                        <section className="space-y-6">
                           <h3 className="text-xl font-black text-primary uppercase tracking-widest pl-2 border-l-4 border-secondary leading-none">Composição Técnica</h3>
                           <div className="flex gap-2">
                             <select value={selectedIngId} onChange={(e) => setSelectedIngId(e.target.value)} className="flex-1 bg-primary/5 p-5 rounded-2xl border border-primary/5 outline-none font-black text-xs">
                               <option value="">Selecionar Insumo...</option>
                               {ingredients.map((ing: any) => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                             </select>
                             <input type="number" placeholder="Qtd" value={selectedAmount} onChange={(e) => setSelectedAmount(parseFloat(e.target.value))} className="w-32 bg-primary/5 p-5 rounded-2xl border border-primary/5 outline-none font-black text-xs" />
                             <button onClick={addIngredientToRecipe} className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl"><Plus size={20}/></button>
                           </div>

                           <div className="space-y-2">
                             {newRecipe.ingredients?.map((ri, i) => {
                                 const ing = ingredients.find((ing: any) => ing.id === ri.ingredientId);
                                 return (
                                     <div key={i} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/5">
                                         <span className="text-xs font-bold text-primary">{ing?.name}</span>
                                         <span className="text-xs font-black text-secondary">{ri.amount}{ing?.unit}</span>
                                     </div>
                                 );
                             })}
                           </div>
                        </section>

                        <div className="flex gap-4">
                            <button onClick={() => setIsCreating(false)} className="flex-1 py-5 bg-primary/5 font-black text-[10px] text-primary uppercase rounded-2xl">Descartar</button>
                            <button onClick={saveRecipe} className="flex-1 py-5 bg-secondary font-black text-[10px] text-white uppercase rounded-2xl shadow-xl shadow-secondary/20 flex items-center justify-center gap-2"><Sparkles size={16}/> Finalizar Engenharia</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((r: Recipe) => (
                    <div key={r.id} className="bg-white p-10 rounded-[4rem] shadow-xl border border-primary/5 group relative hover:border-secondary/20 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-primary tracking-tight leading-none truncate max-w-[200px]">{r.name}</h3>
                            <button className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary transition-all hover:scale-110"><FileText size={18}/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                           <div className="p-4 bg-primary/5 rounded-3xl"><span className="text-[8px] font-black uppercase text-primary/30 block mb-1">Insumos</span><p className="text-lg font-black text-primary">{r.ingredients.length}</p></div>
                           <div className="p-4 bg-secondary/5 rounded-3xl"><span className="text-[8px] font-black uppercase text-secondary/40 block mb-1">Markup</span><p className="text-lg font-black text-secondary">{r.markup}x</p></div>
                        </div>
                        <button className="w-full py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Analisar Lucratividade</button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function SettingsTab() {
  return (
    <div className="p-8 max-w-4xl mx-auto py-20 text-center opacity-20">
       <Settings size={80} className="mx-auto mb-8" />
       <h2 className="text-2xl font-black uppercase tracking-[0.4em]">Configurações</h2>
       <p className="text-sm font-bold mt-4">Página em desenvolvimento para custos fixos globais.</p>
    </div>
  );
}
