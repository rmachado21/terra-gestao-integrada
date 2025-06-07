
import { z } from 'zod';

// Configurações de segurança
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
};

// Validação de email segura
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório')
  .max(255, 'Email muito longo')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido');

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
    script-src 'self' 'unsafe-inline' https://cdn.gpteng.co;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https://tgfnznsvscgvlcizcfzw.supabase.co;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});
