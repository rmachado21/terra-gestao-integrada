
// Função para determinar a máscara do CPF/CNPJ dinamicamente
export const getCpfCnpjMask = (value: string) => {
  // Remove todos os caracteres não numéricos para contar apenas dígitos
  const cleanValue = value.replace(/\D/g, '');
  
  // Se tem 11 dígitos ou menos, usa máscara de CPF
  // Se tem 12 dígitos ou mais, usa máscara de CNPJ
  if (cleanValue.length <= 14) {
    return '999.999.999-99'; // CPF
  } else {
    return '99.999.999/9999-99'; // CNPJ
  }
};

// Função para determinar a máscara do telefone dinamicamente
export const getTelefoneMask = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  // Se tem 10 dígitos ou menos, usa telefone fixo
  // Se tem 11 dígitos ou mais, usa celular
  if (cleanValue.length <= 11) {
    return '(99) 9999-9999'; // Telefone fixo
  } else {
    return '(99) 99999-9999'; // Celular
  }
};

// Função para máscara de CEP
export const getCepMask = () => {
  return '99999-999';
};

// Função para aplicar máscara dinamicamente
export const applyMask = (value: string, maskFunction: (value: string) => string) => {
  if (!value) return '';
  const mask = maskFunction(value);
  let maskedValue = '';
  let valueIndex = 0;
  const cleanValue = value.replace(/\D/g, '');
  
  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else {
      maskedValue += mask[i];
    }
  }
  
  return maskedValue;
};
