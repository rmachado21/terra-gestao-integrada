
// Função para determinar a máscara do CPF/CNPJ dinamicamente
export const getCpfCnpjMask = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 11) {
    return '999.999.999-99'; // CPF
  } else {
    return '99.999.999/9999-99'; // CNPJ
  }
};

// Função para determinar a máscara do telefone dinamicamente
export const getTelefoneMask = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 10) {
    return '(99) 9999-9999'; // Telefone fixo
  } else {
    return '(99) 99999-9999'; // Celular
  }
};
