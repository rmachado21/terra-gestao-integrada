import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import * as XLSX from 'npm:xlsx@0.18.5'
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const tablesToExport = [
  'profiles', 'alertas', 'areas', 'clientes', 'colheitas', 'estoque',
  'itens_pedido', 'movimentacoes_financeiras', 'pedidos', 'plantios',
  'processamentos', 'produtos'
];

async function fetchAllData(supabaseClient: SupabaseClient, userId: string) {
  const workbook = XLSX.utils.book_new();

  for (const tableName of tablesToExport) {
    const idColumn = tableName === 'profiles' ? 'id' : 'user_id';
    
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .eq(idColumn, userId);

    if (error) {
      console.error(`Error fetching ${tableName} for user ${userId}:`, error.message);
      continue; // Skip this table and proceed
    }
    
    if (data && data.length > 0) {
      const sanitizedData = data.map(row => {
        const newRow: { [key: string]: any } = {};
        for (const key in row) {
          if (row[key] instanceof Object && row[key] !== null) {
            newRow[key] = JSON.stringify(row[key]);
          } else {
            newRow[key] = row[key];
          }
        }
        return newRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(sanitizedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, tableName.slice(0, 31));
    }
  }
  return workbook;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const workbook = await fetchAllData(supabaseClient, user.id);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBase64 = encode(new Uint8Array(excelBuffer));

    return new Response(JSON.stringify({ data: excelBase64 }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
