
export const formatDocument = (document: string | null): string => {
  if (!document) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanDocument = document.replace(/\D/g, '');
  
  // Formatar CPF (11 dígitos)
  if (cleanDocument.length === 11) {
    return cleanDocument.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  // Formatar CNPJ (14 dígitos)
  if (cleanDocument.length === 14) {
    return cleanDocument.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  // Retornar sem formatação se não for CPF nem CNPJ
  return document;
};

export const getDocumentLabel = (document: string | null): string => {
  if (!document) return '';
  
  const cleanDocument = document.replace(/\D/g, '');
  
  if (cleanDocument.length === 11) return 'CPF';
  if (cleanDocument.length === 14) return 'CNPJ';
  
  return 'Documento';
};
