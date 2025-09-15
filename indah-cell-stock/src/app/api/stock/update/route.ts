import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, amount } = body;

    if (typeof id !== 'number' || typeof amount !== 'number') {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request body. "id" and "amount" must be numbers.' }),
        { status: 400 }
      );
    }

    // 1. Fetch the current stock
    const { data: currentStock, error: fetchError } = await supabase
      .from('stock')
      .select('stok_sekarang')
      .eq('id', id)
      .single();

    if (fetchError || !currentStock) {
      throw new Error(fetchError?.message || `Stock record with id ${id} not found.`);
    }

    // 2. Calculate the new stock
    const newStockAmount = currentStock.stok_sekarang + amount;

    // 3. Update the stock record
    const { data: updatedStock, error: updateError } = await supabase
      .from('stock')
      .update({ stok_sekarang: newStockAmount })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json(updatedStock);
  } catch (err: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update stock', details: errorMessage }),
      { status: 500 }
    );
  }
}
