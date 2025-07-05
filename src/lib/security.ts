import { z } from 'zod';

// Configurações de segurança
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
};

// Lista de domínios de email temporário bloqueados
const BLOCKED_EMAIL_DOMAINS = [
  '10minutemail.com', '10minutemail.net', '10minutemail.org',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'mailinator.com', 'mailinator.net', 'mailinator.org',
  'tempmail.org', 'temp-mail.org', 'temporarymail.com',
  'yopmail.com', 'yopmail.net', 'yopmail.fr',
  'throwaway.email', 'getnada.com', 'maildrop.cc',
  'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
  'pokemail.net', 'spam4.me', 'tempail.com',
  'dispostable.com', 'fakeinbox.com', 'mailnesia.com'
];

// Domínios comuns para sugestões
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'uol.com.br', 'terra.com.br', 'ig.com.br', 'bol.com.br'
];

// Função para sugerir correção de domínio
export const suggestEmailDomain = (email: string): string | null => {
  const [localPart, domain] = email.split('@');
  if (!domain) return null;

  // Verificar se é uma variação comum de domínios conhecidos
  const domainLower = domain.toLowerCase();
  
  if (domainLower.includes('gmail') && domainLower !== 'gmail.com') {
    return `${localPart}@gmail.com`;
  }
  if (domainLower.includes('yahoo') && domainLower !== 'yahoo.com') {
    return `${localPart}@yahoo.com`;
  }
  if (domainLower.includes('hotmail') && domainLower !== 'hotmail.com') {
    return `${localPart}@hotmail.com`;
  }
  if (domainLower.includes('outlook') && domainLower !== 'outlook.com') {
    return `${localPart}@outlook.com`;
  }

  return null;
};

// Validação avançada de segurança do email
export const validateEmailSecurity = (email: string): { 
  isValid: boolean; 
  error?: string; 
  suggestion?: string; 
} => {
  if (!email) return { isValid: false, error: 'Email é obrigatório' };

  const normalizedEmail = email.toLowerCase().trim();
  const [localPart, domain] = normalizedEmail.split('@');

  if (!localPart || !domain) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // Verificar se o domínio está na lista de bloqueados
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return { 
      isValid: false, 
      error: 'Emails temporários não são permitidos. Use um email permanente.' 
    };
  }

  // Verificar domínios suspeitos
  if (domain.length < 4) {
    return { isValid: false, error: 'Domínio do email parece inválido' };
  }

  // Verificar se tem pelo menos um ponto no domínio
  if (!domain.includes('.')) {
    return { isValid: false, error: 'Domínio do email deve conter um ponto' };
  }

  // Verificar caracteres suspeitos
  if (/[<>\"'&]/.test(email)) {
    return { isValid: false, error: 'Email contém caracteres não permitidos' };
  }

  // Sugerir correção se necessário
  const suggestion = suggestEmailDomain(email);

  return { 
    isValid: true, 
    suggestion: suggestion ? `Você quis dizer: ${suggestion}?` : undefined 
  };
};

// Validação de email segura
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório')
  .max(255, 'Email muito longo')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido')
  .refine((email) => {
    const result = validateEmailSecurity(email);
    return result.isValid;
  }, (email) => {
    const result = validateEmailSecurity(email);
    return { message: result.error || 'Email inválido' };
  })
  .transform((email) => email.toLowerCase().trim());

// Validação de senha robusta
export const passwordSchema = z
  .string()
  .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`)
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

// Sanitização de input
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove caracteres HTML perigosos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .substring(0, 1000); // Limita tamanho
};

// Validação de nome
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
  .transform(sanitizeInput);

// Validação de telefone
export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val), {
    message: 'Telefone deve estar no formato (11) 99999-9999'
  });

// Rate limiting simples
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  isBlocked(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) return false;

    // Reset se passou da janela de tempo
    if (now - record.lastAttempt > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
      this.attempts.delete(identifier);
      return false;
    }

    return record.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now - record.lastAttempt > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
    } else {
      record.count++;
      record.lastAttempt = now;
    }
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

// Sistema de logging seguro
export const secureLogger = {
  info: (message: string, context?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, context);
    }
  },
  
  warn: (message: string, context?: any) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${message}`, context);
    }
  },
  
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // Em produção, apenas log essencial sem dados sensíveis
      console.error(`[ERROR] ${message}`);
    }
  },
  
  security: (event: string, details?: Record<string, any>) => {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      userAgent: navigator.userAgent,
      ...details
    };
    
    if (import.meta.env.DEV) {
      console.log(`[SECURITY] ${event}`, logData);
    }
    
    // Em produção, enviar para sistema de auditoria
    // TODO: Implementar envio para sistema de logging externo
  }
};

// Validação de URL
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Headers de segurança para CSP
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https://tgfnznsvscgvlcizcfzw.supabase.co https://challenges.cloudflare.com;
    frame-src https://challenges.cloudflare.com;
    worker-src https://challenges.cloudflare.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});
