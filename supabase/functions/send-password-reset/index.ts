
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Cliente com privilégios de service role para acessar auth.users
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const generateSecureToken = (): string => {
  // Gerar token de 6 dígitos numéricos
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verificar se o usuário existe
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      console.error("Erro ao buscar usuários:", userError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const user = userData.users.find(u => u.email === email);
    if (!user) {
      // Por segurança, sempre retornar sucesso mesmo se o email não existir
      return new Response(
        JSON.stringify({ success: true, message: "Se o email existir, você receberá instruções de recuperação" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verificar rate limiting (máximo 3 tentativas por hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentTokens, error: countError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error("Erro ao verificar rate limit:", countError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (recentTokens && recentTokens.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Muitas tentativas de recuperação. Tente novamente em 1 hora." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Gerar token seguro
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar token no banco
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        email,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    if (insertError) {
      console.error("Erro ao salvar token:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Enviar email com token
    const emailResponse = await resend.emails.send({
      from: "Gestor Raiz <noreply@gestorraiz.com.br>",
      to: [email],
      subject: "Recuperação de Senha - Gestor Raiz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin: 0;">Gestor Raiz</h1>
            <p style="color: #666; margin: 5px 0;">Sistema de Gestão Integrado</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Recuperação de Senha</h2>
            <p style="color: #666; line-height: 1.5;">
              Você solicitou a recuperação de senha para sua conta. Use o código abaixo para redefinir sua senha:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <div style="background: #16a34a; color: white; padding: 15px 30px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;">
                ${token}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.5;">
              <strong>Este código expira em 15 minutos</strong> por motivos de segurança.
            </p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Importante:</strong> Se você não solicitou esta recuperação, ignore este email. 
              Sua senha permanecerá inalterada.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Este email foi enviado automaticamente. Não responda a este email.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              © ${new Date().getFullYear()} Gestor Raiz. Todos os direitos reservados.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Erro ao enviar email:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email de recuperação enviado:", { email, tokenId: token.substring(0, 2) + '****' });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de recuperação enviado com sucesso" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Erro na função send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
