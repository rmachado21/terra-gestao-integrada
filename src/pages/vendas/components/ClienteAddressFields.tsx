
import InputMask from 'react-input-mask';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClienteFormData } from '../types/cliente';
import { getCepMask } from '@/lib/maskUtils';

interface ClienteAddressFieldsProps {
  form: UseFormReturn<ClienteFormData>;
}

const ClienteAddressFields = ({ form }: ClienteAddressFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="endereco.cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <InputMask
                mask={getCepMask()}
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {(inputProps: any) => (
                  <Input 
                    {...inputProps}
                    placeholder="00000-000" 
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
        name="endereco.logradouro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logradouro</FormLabel>
            <FormControl>
              <Input placeholder="Rua, Avenida, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="endereco.numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input placeholder="123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endereco.complemento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input placeholder="Apt, Sala, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="endereco.bairro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro</FormLabel>
            <FormControl>
              <Input placeholder="Nome do bairro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="endereco.cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input placeholder="Nome da cidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endereco.estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input placeholder="SP" maxLength={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default ClienteAddressFields;
