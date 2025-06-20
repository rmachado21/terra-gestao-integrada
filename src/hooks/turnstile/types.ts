
export interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

export interface TurnstileAPI {
  render: (element: HTMLElement | string, options: TurnstileOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

export interface UseTurnstileReturn {
  widgetRef: React.RefObject<HTMLDivElement>;
  token: string;
  isLoading: boolean;
  error: string;
  isValid: boolean;
  resetWidget: () => void;
  scriptLoaded: boolean;
}
