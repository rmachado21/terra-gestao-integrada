
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DadosVendas } from './types';

interface GraficoVendasDiaProps {
  data: DadosVendas['vendasPorDia'];
}

export const GraficoVendasDia = ({ data }: GraficoVendasDiaProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']} />
            <Line type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
