export interface Stock {
  id: number;
  nama_cabang: 'Soko' | 'Mbutoh';
  produk: string;
  stok_pagi: number;
  stok_sekarang: number;
  tanggal: string; // Using string to represent date in 'YYYY-MM-DD' format
}

export interface StockHistory {
  id: number;
  stock_id: number;
  perubahan: number;
  stok_sebelum: number;
  stok_sesudah: number;
  created_at: string;
}
