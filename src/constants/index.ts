import { Member, Product } from "../types";

export const PRODUCTS: Product[] = [
  { id: 1, name: "Kopi Hitam", price: 15000, category: "Minuman", color: "bg-amber-800" },
  { id: 2, name: "Latte", price: 20000, category: "Minuman", color: "bg-amber-200" },
  { id: 3, name: "Cappuccino", price: 22000, category: "Minuman", color: "bg-amber-300" },
  { id: 4, name: "Nasi Goreng", price: 25000, category: "Makanan", color: "bg-orange-500" },
  { id: 5, name: "Mie Goreng", price: 25000, category: "Makanan", color: "bg-yellow-500" },
  { id: 6, name: "Roti Bakar", price: 12000, category: "Snack", color: "bg-yellow-200" },
  { id: 7, name: "Kentang Goreng", price: 15000, category: "Snack", color: "bg-yellow-100" },
  { id: 8, name: "Es Teh Manis", price: 5000, category: "Minuman", color: "bg-amber-600" },
];

export const CATEGORIES = ["Semua", "Minuman", "Makanan", "Snack"];

export const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Budi Santoso", phone: "081234567890" },
  { id: "2", name: "Siti Aminah", phone: "089876543210" },
  { id: "3", name: "Andi Wijaya", phone: "081122334455" },
];
