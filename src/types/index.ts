// Definisi tipe data global

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  color: string; // Warna placeholder untuk gambar
};

export type CartItem = Product & {
  cartId: string; // ID unik untuk setiap baris di keranjang
  quantity: number;
  notes?: string;
  modifiers?: string[];
};

export type Member = {
  id: string;
  name: string;
  phone: string;
};
