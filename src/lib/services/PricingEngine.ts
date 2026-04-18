/**
 * PricingEngine Service
 * Handles advanced gastronomic math including unit conversions, yield factors, 
 * labor costs, and operational overhead.
 */

export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'un';

export interface Ingredient {
  purchase_price: number;
  purchase_quantity: number;
  purchase_unit: Unit;
  yield_percentage: number; // 0-100
}

export interface RecipeItem {
  ingredient: Ingredient;
  quantity_used: number;
  unit_used: Unit;
}

export interface PricingConfig {
  monthly_salary_target: number;
  working_hours_per_month: number;
  fixed_costs_total: number;
}

export class PricingEngine {
  /**
   * Converts units to a base value (g or ml) for calculation
   */
  private static getBaseMultiplier(unit: Unit): number {
    switch (unit) {
      case 'kg': return 1000;
      case 'L': return 1000;
      default: return 1;
    }
  }

  /**
   * Normalizes units to 'g' or 'ml'
   */
  private static normalizeUnit(unit: Unit): Unit {
    if (unit === 'kg') return 'g';
    if (unit === 'L') return 'ml';
    return unit;
  }

  /**
   * Calculates the real cost of an ingredient considering the yield factor (desperdício)
   */
  public static calculateEffectiveCost(ingredient: Ingredient): number {
    const yieldFactor = 100 / (ingredient.yield_percentage || 100);
    const costPerBaseUnit = ingredient.purchase_price / (ingredient.purchase_quantity * this.getBaseMultiplier(ingredient.purchase_unit));
    return costPerBaseUnit * yieldFactor;
  }

  /**
   * Calculates the cost of a specific recipe item
   */
  public static calculateItemCost(item: RecipeItem): number {
    const effectiveCostPerUnit = this.calculateEffectiveCost(item.ingredient);
    const normalizedQuantity = item.quantity_used * this.getBaseMultiplier(item.unit_used);
    return effectiveCostPerUnit * normalizedQuantity;
  }

  /**
   * Calculates labor cost per minute
   */
  public static calculateLaborRatePerMinute(config: PricingConfig): number {
    const hourlyRate = config.monthly_salary_target / config.working_hours_per_month;
    return hourlyRate / 60;
  }

  /**
   * Calculates fixed costs rate per minute
   */
  public static calculateFixedCostRatePerMinute(config: PricingConfig): number {
    const hourlyRate = config.fixed_costs_total / config.working_hours_per_month;
    return hourlyRate / 60;
  }

  /**
   * Full Recipe Calculation
   */
  public static calculateRecipe(
    items: RecipeItem[],
    prepTime: number,
    ovenTime: number,
    config: PricingConfig,
    markup: number = 2 // default 100% margin
  ) {
    const ingredientsCost = items.reduce((total, item) => total + this.calculateItemCost(item), 0);
    
    const laborRate = this.calculateLaborRatePerMinute(config);
    const fixedRate = this.calculateFixedCostRatePerMinute(config);
    
    const laborCost = prepTime * laborRate;
    const operationalCost = (prepTime + ovenTime) * fixedRate;
    
    const totalProductionCost = ingredientsCost + laborCost + operationalCost;
    const suggestedPrice = totalProductionCost * markup;

    return {
      ingredientsCost,
      laborCost,
      operationalCost,
      totalProductionCost,
      suggestedPrice,
      profit: suggestedPrice - totalProductionCost
    };
  }
}
