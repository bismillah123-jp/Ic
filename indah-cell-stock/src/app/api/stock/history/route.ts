import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stockId = searchParams.get('stock_id');

  if (!stockId) {
    return new NextResponse(
      JSON.stringify({ error: 'Query parameter "stock_id" is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data, error } = await supabase
      .from('stock_history')
      .select('*')
      .eq('stock_id', stockId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data);

  } catch (err: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error('Error in /api/stock/history:', errorMessage);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch stock history', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
