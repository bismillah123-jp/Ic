import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get today's date in YYYY-MM-DD format, considering UTC
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .eq('tanggal', today);

    if (error) {
      console.error('Supabase error:', error.message);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch stock data', details: err.message }),
      { status: 500 }
    );
  }
}
