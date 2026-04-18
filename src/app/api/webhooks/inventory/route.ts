import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

/**
 * n8n Webhook Endpoint
 * Allows external automation to check for inventory shortages or 
 * price fluctuations.
 */
export async function GET(request: Request) {
    const supabase = createClient();
    
    // In a real scenario, this would use a service role key 
    // or a specialized API key for the B2B tenant.
    const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Business Logic: Identify items below the threshold
    const shortages = ingredients.filter(i => 
        i.inventory_alert_threshold && 
        (i.current_stock || 0) <= i.inventory_alert_threshold
    );

    return NextResponse.json({
        status: 'success',
        timestamp: new Date().toISOString(),
        total_items_checked: ingredients.length,
        shortage_count: shortages.length,
        items_to_restock: shortages.map(i => ({
            name: i.name,
            current: i.current_stock,
            threshold: i.inventory_alert_threshold,
            last_price: i.purchase_price
        })),
        action_required: shortages.length > 0
    });
}
