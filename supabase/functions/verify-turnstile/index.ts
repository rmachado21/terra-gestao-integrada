
import { corsHeaders } from '../_shared/cors.ts'

const TURNSTILE_SECRET_KEY = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY')

interface TurnstileResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

Deno.serve(async (req) => {
  console.log('[VERIFY-TURNSTILE] Nova requisição recebida')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[VERIFY-TURNSTILE] Requisição OPTIONS (CORS)')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!TURNSTILE_SECRET_KEY) {
      console.error('[VERIFY-TURNSTILE] CLOUDFLARE_TURNSTILE_SECRET_KEY não configurado')
      return new Response(
        JSON.stringify({ success: false, error: 'Turnstile not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method !== 'POST') {
      console.error('[VERIFY-TURNSTILE] Método não permitido:', req.method)
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const requestBody = await req.json()
    console.log('[VERIFY-TURNSTILE] Body da requisição:', {
      hasToken: !!requestBody.token,
      ip: requestBody.ip,
      timestamp: requestBody.timestamp,
      userAgent: requestBody.userAgent?.substring(0, 50) + '...'
    })

    const { token, ip } = requestBody

    if (!token) {
      console.error('[VERIFY-TURNSTILE] Token não fornecido')
      return new Response(
        JSON.stringify({ success: false, error: 'Token required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('[VERIFY-TURNSTILE] Iniciando verificação com Cloudflare...')

    // Prepare form data
    const formData = new FormData()
    formData.append('secret', TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    console.log('[VERIFY-TURNSTILE] Enviando requisição para Cloudflare...')

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      console.error('[VERIFY-TURNSTILE] Resposta não OK do Cloudflare:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ success: false, error: 'Cloudflare verification failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result: TurnstileResponse = await response.json()

    console.log('[VERIFY-TURNSTILE] Resultado da verificação:', { 
      success: result.success, 
      errorCodes: result['error-codes'],
      hostname: result.hostname,
      challenge_ts: result.challenge_ts
    })

    if (result.success) {
      console.log('[VERIFY-TURNSTILE] ✅ Verificação bem-sucedida')
      return new Response(
        JSON.stringify({ 
          success: true,
          hostname: result.hostname,
          challenge_ts: result.challenge_ts 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.error('[VERIFY-TURNSTILE] ❌ Verificação falhou:', result['error-codes'])
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Verification failed',
          errorCodes: result['error-codes'] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('[VERIFY-TURNSTILE] ❌ Erro inesperado:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
