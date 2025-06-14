
import InputMask from 'react-input-mask';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClienteFormData } from '../types/cliente';
import { getCpfCnpjMask, getTelefoneMask } from '@/lib/maskUtils';

interface ClienteBasicFieldsProps {
  form: UseFormReturn<ClienteFormData>;
}

const ClienteBasicFields = ({ form }: ClienteBasicFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Nome do cliente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="email@exemplo.com" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <InputMask
                mask={getTelefoneMask(field.value || '')}
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {(inputProps: any) => (
                  <Input 
                    {...inputProps}
                    placeholder="(11) 99999-9999" 
                  />
                )}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cpf_cnpj"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF/CNPJ *</FormLabel>
            <FormControl>
              <InputMask
                mask={getCpfCnpjMask(field.value || '')}
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {(inputProps: any) => (
                  <Input 
                    {...inputProps}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00" 
                  />
                )}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ClienteBasicFields;
