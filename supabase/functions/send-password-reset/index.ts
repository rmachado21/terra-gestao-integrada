
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

const extractFirstValidIP = (forwardedFor: string | null): string => {
  if (!forwardedFor) {
    return '127.0.0.1'; // fallback IP
  }
  
  // Pegar apenas o primeiro IP da lista (antes da primeira vírgula)
  const firstIP = forwardedFor.split(',')[0].trim();
  
  // Validar se é um IP válido (IPv4 básico)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(firstIP)) {
    return firstIP;
  }
  
  console.log('[RESET] IP inválido detectado:', firstIP, 'usando fallback');
  return '127.0.0.1'; // fallback para IP inválido
};

const handler = async (req: Request): Promise<Response> => {
  console.log('[RESET] === FUNÇÃO INICIADA ===');
  console.log('[RESET] Método:', req.method);
  console.log('[RESET] URL:', req.url);
  console.log('[RESET] Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    console.log('[RESET] Respondendo a preflight CORS');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[RESET] Iniciando processo de recuperação de senha');
    
    // Verificar se as variáveis de ambiente estão configuradas
    console.log('[RESET] Verificando variáveis de ambiente...');
    console.log('[RESET] SUPABASE_URL:', supabaseUrl ? 'CONFIGURADA' : 'AUSENTE');
    console.log('[RESET] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'CONFIGURADA' : 'AUSENTE');
    console.log('[RESET] RESEND_API_KEY:', Deno.env.get("RESEND_API_KEY") ? 'CONFIGURADA' : 'AUSENTE');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[RESET] Variáveis de ambiente do Supabase não configuradas');
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error('[RESET] RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: "Serviço de email não configurado" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requestBody = await req.text();
    console.log('[RESET] Body da requisição:', requestBody);

    const { email }: PasswordResetRequest = JSON.parse(requestBody);
    console.log('[RESET] Email solicitado:', email);

    if (!email || typeof email !== 'string') {
      console.log('[RESET] Email inválido ou ausente');
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('[RESET] Verificando se usuário existe...');
    
    // Verificar se o usuário existe
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      console.error("[RESET] Erro ao buscar usuários:", userError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const user = userData.users.find(u => u.email === email);
    if (!user) {
      console.log('[RESET] Usuário não encontrado para email:', email);
      // Por segurança, sempre retornar sucesso mesmo se o email não existir
      return new Response(
        JSON.stringify({ success: true, message: "Se o email existir, você receberá instruções de recuperação" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('[RESET] Usuário encontrado, ID:', user.id);
    console.log('[RESET] Verificando rate limit...');

    // Verificar rate limiting (máximo 3 tentativas por hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentTokens, error: countError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error("[RESET] Erro ao verificar rate limit:", countError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('[RESET] Tokens recentes encontrados:', recentTokens?.length || 0);

    if (recentTokens && recentTokens.length >= 3) {
      console.log('[RESET] Rate limit atingido para email:', email);
      return new Response(
        JSON.stringify({ error: "Muitas tentativas de recuperação. Tente novamente em 1 hora." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Gerar token seguro
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    
    console.log('[RESET] Token gerado:', token.substring(0, 2) + '****');
    console.log('[RESET] Expira em:', expiresAt.toISOString());

    // Extrair IP corretamente
    const clientIP = extractFirstValidIP(req.headers.get('x-forwarded-for'));
    console.log('[RESET] IP extraído:', clientIP);

    // Salvar token no banco
    console.log('[RESET] Salvando token no banco...');
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        email,
        expires_at: expiresAt.toISOString(),
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    if (insertError) {
      console.error("[RESET] Erro ao salvar token:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('[RESET] Token salvo com sucesso no banco');
    console.log('[RESET] Preparando para enviar email via Resend...');

    // Enviar email com token
    console.log('[RESET] Enviando email via Resend...');
    
    try {
      const emailResponse = await resend.emails.send({
        from: "Gestor Raiz <noreply@resend.dev>", // Usando domínio padrão do Resend
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

      console.log("[RESET] Resposta do Resend:", emailResponse);

      if (emailResponse.error) {
        console.error("[RESET] Erro ao enviar email:", emailResponse.error);
        return new Response(
          JSON.stringify({ error: "Erro ao enviar email de recuperação", details: emailResponse.error }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("[RESET] Email enviado com sucesso!", {
        email,
        tokenPrefix: token.substring(0, 2) + '****',
        emailId: emailResponse.data?.id
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email de recuperação enviado com sucesso",
          emailId: emailResponse.data?.id
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } catch (emailError: any) {
      console.error("[RESET] Erro no envio do email:", emailError);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email", details: emailError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

  } catch (error: any) {
    console.error("[RESET] Erro geral na função:", error);
    console.error("[RESET] Stack trace:", error.stack);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
