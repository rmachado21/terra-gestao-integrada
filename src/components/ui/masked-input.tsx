
import * as React from "react";
import InputMask from 'react-input-mask';
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface MaskedInputProps extends React.ComponentProps<"input"> {
  mask: string;
  maskChar?: string;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, maskChar = '', ...props }, ref) => {
    return (
      <InputMask
        mask={mask}
        maskChar={maskChar}
        {...props}
      >
        {(inputProps: any) => (
          <Input
            {...inputProps}
            ref={ref}
            className={cn(className)}
          />
        )}
      </InputMask>
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput };
