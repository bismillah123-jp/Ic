export interface Stock {
  id: number;
  nama_cabang: 'Soko' | 'Mbutoh';
  produk: string;
  stok_pagi: number;
  stok_sekarang: number;
  tanggal: string; // Using string to represent date in 'YYYY-MM-DD' format
}
