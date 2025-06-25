
// Componente removido - Turnstile desabilitado
interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  disabled?: boolean;
}

export const TurnstileWidget = ({ onSuccess }: TurnstileWidgetProps) => {
  // Simular sucesso imediato para manter compatibilidade
  // mas sem exibir nenhum widget visual
  setTimeout(() => {
    onSuccess('disabled');
  }, 100);

  return null;
};
