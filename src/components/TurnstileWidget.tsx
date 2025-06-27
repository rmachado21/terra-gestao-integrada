
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

const TurnstileWidget = ({ onVerify, onError }: TurnstileWidgetProps) => {
  // Chave do site para Cloudflare Turnstile (substitua pela sua chave real)
  const siteKey = '0x4AAAAAAAkC_8nJb7dp8sLN'; // Esta é uma chave de teste, substitua pela real

  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        size="normal"
      />
    </div>
  );
};

export { TurnstileWidget };
