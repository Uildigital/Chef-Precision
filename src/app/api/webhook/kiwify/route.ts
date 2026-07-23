import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verifica se a venda foi aprovada
    if (body.order_status === 'approved' || body.order_status === 'paid') {
      const email = body.Customer?.email;
      
      if (!email) {
        return NextResponse.json({ error: 'Email do cliente nao encontrado no payload' }, { status: 400 });
      }

      // Conecta ao Supabase com privilégios máximos (Service Role)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Cria a conta do usuário silenciosamente
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'Chef@123', // Senha Padrão
        email_confirm: true,  // Confirma automaticamente o email
      });

      if (error) {
        console.error("Erro ao criar usuário (Pode já existir):", error.message);
        return NextResponse.json({ success: true, message: 'Compra registrada, mas conta já existia.' });
      }

      return NextResponse.json({ success: true, message: 'Conta criada com sucesso!' });
    }

    return NextResponse.json({ success: true, message: 'Evento ignorado (não é uma compra aprovada).' });

  } catch (error: any) {
    console.error("Erro no Webhook da Kiwify:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
