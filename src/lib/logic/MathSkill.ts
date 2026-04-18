import { Insumo, Receita } from "@/app/page";

export const MathSkill = {
    calcularCustoIngredientes: (itens: any[], insumos: Insumo[]) => {
        return itens.reduce((acc, curr) => {
            const ins = insumos.find((i) => i.id === curr.id_insumo);
            return acc + (ins ? (ins.price / ins.quantity) * curr.quantidade_usada : 0);
        }, 0);
    },

    calcularCustoOperacional: (receita: Receita, config: any) => {
        const tempoTotal = (receita.tempo_preparo || 0) + (receita.tempo_forno || 0);
        const totalContas = Object.values(config.contas || {}).reduce((a: any, b: any) => a + (b || 0), 0) as number;
        const custoMinutoOperacional = (totalContas / (config.horas_trabalhadas_mes || 160)) / 60;
        return tempoTotal * custoMinutoOperacional;
    },

    calcularCustoMaoDeObra: (receita: Receita, config: any) => {
        const custoMinutoSalario = ((config.salario_desejado || 2500) / (config.horas_trabalhadas_mes || 160)) / 60;
        return (receita.tempo_preparo || 0) * custoMinutoSalario;
    },

    formatarMoeda: (valor: number) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
};
