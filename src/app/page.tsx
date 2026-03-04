"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Tipe data untuk Produk
type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  color: string; // Warna placeholder untuk gambar
};

// Tipe data untuk Item Keranjang
type CartItem = Product & {
  cartId: string; // ID unik untuk setiap baris di keranjang (membedakan preferensi)
  quantity: number;
  notes?: string;
  modifiers?: string[];
};

// Data Dummy Produk
const PRODUCTS: Product[] = [
  { id: 1, name: "Kopi Hitam", price: 15000, category: "Minuman", color: "bg-amber-800" },
  { id: 2, name: "Latte", price: 20000, category: "Minuman", color: "bg-amber-200" },
  { id: 3, name: "Cappuccino", price: 22000, category: "Minuman", color: "bg-amber-300" },
  { id: 4, name: "Nasi Goreng", price: 25000, category: "Makanan", color: "bg-orange-500" },
  { id: 5, name: "Mie Goreng", price: 25000, category: "Makanan", color: "bg-yellow-500" },
  { id: 6, name: "Roti Bakar", price: 12000, category: "Snack", color: "bg-yellow-200" },
  { id: 7, name: "Kentang Goreng", price: 15000, category: "Snack", color: "bg-yellow-100" },
  { id: 8, name: "Es Teh Manis", price: 5000, category: "Minuman", color: "bg-amber-600" },
];

const CATEGORIES = ["Semua", "Minuman", "Makanan", "Snack"];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  // State untuk mobile view: 'cart' (default tampilan HP) atau 'products'
  const [mobileView, setMobileView] = useState<"cart" | "products">("cart");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // Default true, akan diupdate oleh useEffect
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // State untuk modal logout
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "info",
    visible: false,
  });

  // State untuk Modal & Kustomisasi
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notes, setNotes] = useState("");
  const [sugarLevel, setSugarLevel] = useState("Normal Sweet"); // Opsi Minuman
  const [spiciness, setSpiciness] = useState("Tidak Pedas"); // Opsi Makanan

  // Helper untuk menampilkan Toast
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Effect untuk memantau status koneksi internet
  useEffect(() => {
    // Cek status awal saat mount
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      showToast("Koneksi Internet Terhubung", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("Koneksi Internet Terputus", "error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Effect untuk Auto-Sync saat kembali Online
  useEffect(() => {
    if (isOnline) {
      const pendingData = localStorage.getItem("pending_orders");
      if (pendingData) {
        const orders = JSON.parse(pendingData);
        if (orders.length > 0) {
          console.log("🔄 KONEKSI PULIH: Melakukan sinkronisasi data...", orders);
          
          // Simulasi kirim ke API
          // await api.post('/sync', orders);
          
          localStorage.removeItem("pending_orders");
          showToast(`Sinkronisasi: ${orders.length} transaksi offline berhasil dikirim.`, "info");
        }
      }
    }
  }, [isOnline]);

  // Fungsi membuka modal saat produk diklik
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setNotes("");
    setSugarLevel("Normal Sweet");
    setSpiciness("Tidak Pedas");
  };

  // Fungsi konfirmasi tambah ke keranjang (dari modal)
  const confirmAddToCart = () => {
    if (!selectedProduct) return;

    const modifiers = [];
    if (selectedProduct.category === "Minuman") modifiers.push(sugarLevel);
    if (selectedProduct.category === "Makanan") modifiers.push(spiciness);

    const newItem: CartItem = {
      ...selectedProduct,
      cartId: crypto.randomUUID(), // Membuat ID unik setiap kali tambah
      quantity: 1,
      notes: notes,
      modifiers: modifiers,
    };

    setCart((prev) => [...prev, newItem]);
    setSelectedProduct(null); // Tutup modal
  };

  // Fungsi update quantity (tambah/kurang)
  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Fungsi Logout
  const handleLogout = () => {
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    console.log("Logout berhasil");
    showToast("Logout berhasil", "success");
    setShowLogoutConfirm(false);
    // Di sini bisa ditambahkan logika redirect ke halaman login
  };

  // Fungsi Bayar (Simulasi Offline/Online)
  const handlePayment = () => {
    if (cart.length === 0) return;

    const orderData = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cart,
      total: totalAmount,
      status: "pending", // Status awal
    };

    if (isOnline) {
      // Skenario Online: Kirim ke API
      console.log("ONLINE: Mengirim data ke server...", orderData);
      // await api.post('/orders', orderData)...
      showToast("Pembayaran Berhasil! Data terkirim ke server.", "success");
    } else {
      // Skenario Offline: Simpan ke Local Storage (sebagai simulasi IndexedDB)
      console.log("OFFLINE: Menyimpan ke database lokal...", orderData);
      
      // Ambil data lama, tambah data baru
      const pendingOrders = JSON.parse(localStorage.getItem("pending_orders") || "[]");
      pendingOrders.push(orderData);
      localStorage.setItem("pending_orders", JSON.stringify(pendingOrders));

      showToast("Mode Offline: Pesanan disimpan di perangkat.", "info");
    }

    setCart([]); // Kosongkan keranjang setelah proses
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Helper untuk menghitung total qty produk tertentu di keranjang (untuk badge)
  const getProductQtyInCart = (productId: number) => {
    return cart
      .filter((item) => item.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  const filteredProducts =
    selectedCategory === "Semua"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === selectedCategory);

  // Komponen Menu Dropdown (Titik Tiga)
  const MenuDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Keluar
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-gray-100 text-gray-900 font-sans overflow-hidden">
      {/* TOAST NOTIFICATION */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
          toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div
          className={`px-6 py-3 rounded-full shadow-xl font-medium text-white flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-gray-800"
          }`}
        >
          {toast.type === "success" && <span>✓</span>}
          {toast.type === "error" && <span>⚠</span>}
          {toast.message}
        </div>
      </div>

      {/* 
        BAGIAN KIRI: DAFTAR PRODUK 
        - Di Desktop (md:flex): Selalu muncul (w-2/3 atau flex-1)
        - Di Mobile: Muncul hanya jika mobileView === 'products' (fullscreen)
      */}
      <div
        className={`flex-1 flex-col bg-gray-50 transition-all duration-300 ${
          mobileView === "products" ? "flex absolute inset-0 z-20" : "hidden md:flex"
        }`}
      >
        {/* Header Produk (Mobile Only Back Button) */}
        <div className="md:hidden p-4 bg-white shadow-sm flex items-center justify-between border-b border-gray-200">
          <button
            onClick={() => {
              setMobileView("cart");
              setIsMenuOpen(false);
            }}
            className="text-blue-600 font-semibold flex items-center gap-1"
          >
            &larr; Kembali
          </button>
          <span className="font-bold text-lg">Pilih Produk</span>
          {/* Menu Button Mobile */}
          <MenuDropdown />
        </div>

        {/* Mobile Category Tabs */}
        <div className="md:hidden px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto p-1 bg-gray-100 rounded-xl">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {selectedCategory === category && (
                  <motion.div
                    layoutId="activeCategoryMobile"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Header Desktop */}
        <div className="hidden md:block bg-white">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Menu</h1>
            {/* Menu Button Desktop */}
            <MenuDropdown />
          </div>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex overflow-x-auto p-1 bg-gray-100 rounded-xl">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {selectedCategory === category && (
                    <motion.div
                      layoutId="activeCategoryDesktop"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Produk */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const qtyInCart = getProductQtyInCart(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200 flex flex-col overflow-hidden group relative"
                >
                  {/* Badge Jumlah di Keranjang */}
                  {qtyInCart > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10">
                      {qtyInCart}
                    </div>
                  )}

                  {/* Placeholder Image */}
                  <div className={`h-32 w-full flex items-center justify-center text-white font-bold text-2xl ${product.color}`}>
                    {product.name.charAt(0)}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 font-medium mt-2">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 
        BAGIAN KANAN: KERANJANG (CART)
        - Di Desktop (md:flex): Selalu muncul sebagai sidebar kanan (w-[400px])
        - Di Mobile: Muncul hanya jika mobileView === 'cart' (fullscreen)
      */}
      <div
        className={`w-full md:w-[400px] bg-white border-l border-gray-200 flex-col h-full shadow-xl z-10 ${
          mobileView === "cart" ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Header Cart */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-800">Pesanan</h2>
          <div className="flex items-center gap-3">
            {/* Indikator Offline */}
            {!isOnline && (
              <div className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                Offline
              </div>
            )}
            
            <button className="text-blue-600 text-sm font-semibold bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
              + Member
            </button>
            {/* Menu Button Mobile */}
            <div className="md:hidden">
              <MenuDropdown />
            </div>
          </div>
        </div>

        {/* List Item Cart */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="font-medium">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="flex justify-between items-start p-2 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-0">
                <div className="flex-1 pr-2">
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  {/* Menampilkan Modifiers & Notes */}
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    {item.modifiers?.map((mod, idx) => (
                      <span key={idx} className="block text-blue-600">• {mod}</span>
                    ))}
                    {item.notes && <span className="block text-gray-400 italic">"{item.notes}"</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    @ Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-semibold text-gray-800">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </div>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.cartId, -1)}
                      className="w-6 h-6 rounded bg-white text-gray-600 flex items-center justify-center shadow-sm hover:text-red-500"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartId, 1)}
                      className="w-6 h-6 rounded bg-white text-gray-600 flex items-center justify-center shadow-sm hover:text-blue-500"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Cart (Total & Actions) */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Subtotal</span>
              <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Pajak (10%)</span>
              <span>Rp {(totalAmount * 0.1).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>Rp {(totalAmount * 1.1).toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 px-4 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors">
              Open Bill
            </button>
            <button 
              onClick={handlePayment}
              className="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Bayar
            </button>
          </div>

          {/* Mobile Only: Add Product Button */}
          {/* Tombol ini hanya muncul di HP (md:hidden) untuk pindah ke layar produk */}
          <div className="md:hidden pt-2">
            <button
              onClick={() => {
                setMobileView("products");
                setIsMenuOpen(false);
              }}
              className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <span className="text-xl">+</span> Tambah Produk
            </button>
          </div>
        </div>
      </div>

      {/* MODAL POPUP */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className={`p-6 ${selectedProduct.color} text-white`}>
              <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
              <p className="opacity-90">Rp {selectedProduct.price.toLocaleString("id-ID")}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Opsi Minuman */}
              {selectedProduct.category === "Minuman" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tingkat Manis</label>
                  <div className="flex gap-2">
                    {["Normal Sweet", "Less Sweet", "No Sugar"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSugarLevel(opt)}
                        className={`px-3 py-2 rounded-lg text-sm border ${
                          sugarLevel === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Opsi Makanan */}
              {selectedProduct.category === "Makanan" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tingkat Pedas</label>
                  <div className="flex gap-2">
                    {["Tidak Pedas", "Sedang", "Pedas", "Extra Pedas"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSpiciness(opt)}
                        className={`px-3 py-2 rounded-lg text-sm border ${
                          spiciness === opt ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 border-gray-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Catatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Jangan pakai bawang..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3 bg-gray-50">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={confirmAddToCart}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Keluar</h3>
            <p className="text-gray-500 mb-6">Apakah Anda yakin ingin mengakhiri sesi kasir ini?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
              >
                Batal
              </button>
              <button onClick={confirmLogout} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200">
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
