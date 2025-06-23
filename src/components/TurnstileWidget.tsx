
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  disabled?: boolean;
}

export const TurnstileWidget = ({ 
  onSuccess, 
  onError, 
  onExpire, 
  disabled 
}: TurnstileWidgetProps) => {
  // Site key do Cloudflare Turnstile (exemplo - substituir pela chave real)
  const siteKey = "0x4AAAAAAABkMYinukE8nzYS"; // Esta é uma chave de teste

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      />
    </div>
  );
};
