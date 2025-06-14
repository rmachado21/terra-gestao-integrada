
// Função para determinar a máscara do CPF/CNPJ dinamicamente
export const getCpfCnpjMask = (value: string) => {
  // Remove todos os caracteres não numéricos para contar apenas dígitos
  const cleanValue = value.replace(/\D/g, '');
  
  // Se tem 11 dígitos ou menos, usa máscara de CPF
  if (cleanValue.length <= 11) {
    return '999.999.999-99'; // CPF
  } else {
    return '99.999.999/9999-99'; // CNPJ
  }
};

// Função para determinar a máscara do telefone dinamicamente
export const getTelefoneMask = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  // Prioriza celular (11 dígitos) sobre telefone fixo (10 dígitos)
  if (cleanValue.length <= 10) {
    return '(99) 9999-9999'; // Telefone fixo
  } else {
    return '(99) 99999-9999'; // Celular
  }
};
