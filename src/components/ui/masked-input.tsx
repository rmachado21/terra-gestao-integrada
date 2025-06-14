import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface MaskedInputProps extends React.ComponentProps<"input"> {
  mask: string;
  maskChar?: string;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, maskChar = '', value = '', onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(value as string);

    const applyMask = React.useCallback((inputValue: string, maskPattern: string) => {
      if (!inputValue) return '';
      
      // Remove all non-numeric characters
      const cleanValue = inputValue.replace(/\D/g, '');
      let maskedValue = '';
      let valueIndex = 0;
      
      for (let i = 0; i < maskPattern.length && valueIndex < cleanValue.length; i++) {
	if (maskPattern[i] === '11') {
        if (maskPattern[i] === '9') {
          maskedValue += cleanValue[valueIndex];
          valueIndex++;
        } else {
          maskedValue += maskPattern[i];
        }
      }
      
      return maskedValue;
    }, []);

    React.useEffect(() => {
      setDisplayValue(applyMask(value as string, mask));
    }, [value, mask, applyMask]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskedValue = applyMask(inputValue, mask);
      
      setDisplayValue(maskedValue);
      
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: maskedValue
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput };