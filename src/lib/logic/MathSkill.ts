import { Insumo, Receita } from "@/app/page";
import { PricingEngine, Ingredient, RecipeItem } from "@/lib/services/PricingEngine";

export const MathSkill = {
    calcularCustoIngredientes: (itens: any[], insumos: Insumo[]) => {
        return itens.reduce((acc, curr) => {
            const ins = insumos.find((i) => i.id === curr.id_insumo);
            if (!ins) return acc;
            
            const ingredient: Ingredient = {
                purchase_price: ins.price,
                purchase_quantity: ins.quantity,
                purchase_unit: (ins as any).unit || 'g',
                yield_percentage: (ins as any).yield_percentage || 100
            };
            
            const item: RecipeItem = {
                ingredient,
                quantity_used: curr.quantidade_usada,
                unit_used: curr.unit_used || 'g'
            };
            
            return acc + PricingEngine.calculateItemCost(item);
        }, 0);
    },

    calcularCustoOperacional: (receita: Receita, config: any) => {
        const totalContas = Object.values(config.contas || {}).reduce((a: any, b: any) => a + (b || 0), 0) as number;
        const pricingConfig = {
            monthly_salary_target: config.salario_desejado || 2500,
            working_hours_per_month: config.horas_trabalhadas_mes || 160,
            fixed_costs_total: totalContas
        };
        
        const rates = {
            labor: PricingEngine.calculateLaborRatePerMinute(pricingConfig),
            fixed: PricingEngine.calculateFixedCostRatePerMinute(pricingConfig)
        };

        const laborCost = (receita.tempo_preparo || 0) * rates.labor;
        const operationalCost = ((receita.tempo_preparo || 0) + (receita.tempo_forno || 0)) * rates.fixed;
        
        return { laborCost, operationalCost };
    },

    formatarMoeda: (valor: number) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
};
