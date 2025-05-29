
export const filterAlertas = (
  alertas: any[],
  filtroTipo: string,
  filtroPrioridade: string,
  termoBusca: string
) => {
  return alertas.filter(alerta => {
    const matchTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
    const matchPrioridade = filtroPrioridade === 'todas' || alerta.prioridade === filtroPrioridade;
    const matchBusca = alerta.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                      alerta.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    
    return matchTipo && matchPrioridade && matchBusca;
  });
};
