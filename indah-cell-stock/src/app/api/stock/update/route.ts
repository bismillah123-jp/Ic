import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, amount } = body;

    // Validate input
    if (typeof id !== 'number' || typeof amount !== 'number') {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request body. "id" (stock_id) and "amount" (perubahan) must be numbers.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call the PostgreSQL function
    const { error } = await supabase.rpc('update_stock_and_log_history', {
      p_stock_id: id,
      p_perubahan: amount,
    });

    if (error) {
      // The error might be from the function itself (e.g., stock not found)
      // or a database-level error.
      console.error('RPC call failed:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, message: 'Stock updated and history logged successfully.' });

  } catch (err: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error('Error in /api/stock/update:', errorMessage);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update stock', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
