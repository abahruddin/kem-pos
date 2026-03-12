"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CartItem, Member, Product } from "../types";
import { CATEGORIES, INITIAL_MEMBERS, PRODUCTS } from "../constants";
import { MenuDropdown } from "../components/MenuDropdown";
import { ProductCard } from "../components/ProductCard";
import { PaymentModal } from "../components/PaymentModal";
import { Receipt } from "../components/Receipt";

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

  const [tableNumber, setTableNumber] = useState("1");
  const [openBills, setOpenBills] = useState<any[]>([]);
  const [billId, setBillId] = useState<string | null>(null);
  const [isOpenBillListModalOpen, setIsOpenBillListModalOpen] = useState(false);

  // State untuk Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | null>(null);
  const [cashAmount, setCashAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // State untuk Member
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

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

  // Effect untuk memuat member pending (offline) saat mount
  useEffect(() => {
    const pendingMembers = localStorage.getItem("pending_members");
    if (pendingMembers) {
      try {
        const parsed = JSON.parse(pendingMembers);
        // Gabungkan dengan member awal, hindari duplikasi ID
        setMembers((prev) => [...prev, ...parsed.filter((m: Member) => !prev.some((pm) => pm.id === m.id))]);
      } catch (e) {
        console.error("Gagal memuat member pending", e);
      }
    }
  }, []);

  // Effect untuk memuat open bills dari local storage saat mount
  useEffect(() => {
    const savedBills = localStorage.getItem("open_bills");
    if (savedBills) {
      try {
        setOpenBills(JSON.parse(savedBills));
      } catch (e) {
        console.error("Gagal memuat open bills", e);
      }
    }
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

      const pendingMembers = localStorage.getItem("pending_members");
      if (pendingMembers) {
        const membersData = JSON.parse(pendingMembers);
        if (membersData.length > 0) {
          console.log("🔄 KONEKSI PULIH: Sinkronisasi member...", membersData);
          localStorage.removeItem("pending_members");
          showToast(`Sinkronisasi: ${membersData.length} member baru berhasil dikirim.`, "info");
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

  // Fungsi Tambah Member Baru
  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      showToast("Nama dan Nomor HP wajib diisi", "error");
      return;
    }

    const newMember: Member = {
      id: crypto.randomUUID(),
      name: newMemberName,
      phone: newMemberPhone,
    };

    setMembers((prev) => [...prev, newMember]);

    if (!isOnline) {
      const pending = JSON.parse(localStorage.getItem("pending_members") || "[]");
      pending.push(newMember);
      localStorage.setItem("pending_members", JSON.stringify(pending));
    }

    setNewMemberName("");
    setNewMemberPhone("");
    setIsAddingMember(false);
    showToast(isOnline ? "Member berhasil ditambahkan" : "Mode Offline: Member disimpan", isOnline ? "success" : "info");
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

  // Fungsi Open Bill
  const handleOpenBill = () => {
    if (cart.length === 0) {
      showToast("Keranjang kosong", "error");
      return;
    }

    if (!selectedMember) {
      showToast("Silakan pilih member terlebih dahulu", "info");
      setIsMemberModalOpen(true);
      return;
    }

    const newBill = {
      id: billId || crypto.randomUUID(),
      date: new Date().toISOString(),
      tableNumber,
      member: selectedMember,
      items: cart,
      total: totalAmount,
      status: "open",
    };

    let updatedBills;
    if (billId) {
      // Update existing bill: ganti data lama dengan yang baru
      updatedBills = openBills.map((b) => (b.id === billId ? newBill : b));
    } else {
      // Add new bill: tambahkan ke list
      updatedBills = [...openBills, newBill];
    }

    setOpenBills(updatedBills);
    localStorage.setItem("open_bills", JSON.stringify(updatedBills));

    setCart([]);
    setSelectedMember(null);
    setBillId(null);
    setTableNumber("1");
    showToast(billId ? "Bill berhasil diperbarui" : "Bill berhasil dibuka (Open Bill)", "success");
  };

  // Fungsi Load Bill
  const handleLoadBill = (bill: any) => {
    setCart(bill.items);
    setSelectedMember(bill.member);
    setTableNumber(bill.tableNumber);
    setBillId(bill.id);

    // Remove from openBills
    // const updatedBills = openBills.filter((b) => b.id !== bill.id);
    // setOpenBills(updatedBills);
    // localStorage.setItem("open_bills", JSON.stringify(updatedBills));

    setIsOpenBillListModalOpen(false);
    showToast("Bill berhasil dimuat", "success");
  };

  // Fungsi Buka Modal Pembayaran
  const handlePayment = () => {
    if (cart.length === 0) {
      showToast("Keranjang kosong", "error");
      return;
    }
    setPaymentMethod(null);
    setCashAmount("");
    setChangeAmount(0);
    setIsPaymentModalOpen(true);
  };

  // Fungsi Proses Pembayaran (Simulasi Offline/Online)
  const processPayment = () => {
    if (cart.length === 0) return;

    const orderData = {
      id: billId ?? crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cart,
      total: totalAmount,
      tableNumber,
      member: selectedMember,
      status: "paid",
      paymentMethod,
      cashAmount: paymentMethod === "cash" ? parseInt(cashAmount || "0", 10) : totalAmount,
      changeAmount: paymentMethod === "cash" ? changeAmount : 0,
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

    const updatedBills = openBills.filter((b) => b.id !== orderData.id);
    setOpenBills(updatedBills);
    localStorage.setItem("open_bills", JSON.stringify(updatedBills));

    setReceiptData(orderData);

    setCart([]); // Kosongkan keranjang setelah proses
    setSelectedMember(null);
    setBillId(null);
    setTableNumber("1");
    setIsPaymentModalOpen(false);

    setTimeout(() => window.print(), 500);
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

  return (
    <>
    <div className="flex h-screen w-full bg-gray-100 text-gray-900 font-sans overflow-hidden print:hidden">
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
          <MenuDropdown
            isOpen={isMenuOpen}
            onToggle={() => setIsMenuOpen(!isMenuOpen)}
            onOpenBillList={() => {
              setIsOpenBillListModalOpen(true);
              setIsMenuOpen(false);
            }}
            onLogout={handleLogout}
          />
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
            <MenuDropdown
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen(!isMenuOpen)}
              onOpenBillList={() => {
                setIsOpenBillListModalOpen(true);
                setIsMenuOpen(false);
              }}
              onLogout={handleLogout}
            />
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
                <ProductCard
                  key={product.id}
                  product={product}
                  qtyInCart={qtyInCart}
                  onClick={handleProductClick}
                />
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
        <div className="p-5 border-b border-gray-200 bg-white space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Pesanan</h2>
            <div className="flex items-center gap-3">
              {/* Indikator Offline */}
              {!isOnline && (
                <div className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  Offline
                </div>
              )}
              {/* Menu Button Mobile */}
              <div className="md:hidden">
                <MenuDropdown
                  isOpen={isMenuOpen}
                  onToggle={() => setIsMenuOpen(!isMenuOpen)}
                  onOpenBillList={() => {
                    setIsOpenBillListModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-20">
              <label className="block text-xs font-bold text-gray-500 mb-1">Meja</label>
              <input 
                type="text" 
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-center"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">Pelanggan</label>
              <button 
                onClick={() => setIsMemberModalOpen(true)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors truncate flex items-center gap-2 ${
                  selectedMember 
                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {selectedMember ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {selectedMember.name}
                  </>
                ) : (
                  "+ Pilih Member"
                )}
              </button>
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
            <button 
              onClick={handleOpenBill}
              className="py-3 px-4 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
            >
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

      {/* MODAL MEMBER */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{isAddingMember ? "Tambah Member Baru" : "Pilih Member"}</h3>
              <button onClick={() => { setIsMemberModalOpen(false); setIsAddingMember(false); }} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
             {isAddingMember ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Masukkan nama member"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nomor HP</label>
                    <input
                      type="tel"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Contoh: 0812..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setIsAddingMember(false)} className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50">
                      Batal
                    </button>
                    <button onClick={handleAddMember} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
                      Simpan
                   </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Cari nama atau nomor HP..."
                      className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239CA3AF\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '12px center', backgroundSize: '20px' }}
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch)).map((member) => (
                      <button
                        key={member.id}
                        onClick={() => { setSelectedMember(member); setIsMemberModalOpen(false); }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${
                          selectedMember?.id === member.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-gray-800">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.phone}</div>
                       </div>
                        {selectedMember?.id === member.id && <span className="text-blue-600 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>

                  <button onClick={() => setIsAddingMember(true)} className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-bold hover:bg-blue-50 transition-colors">
                    + Tambah Member Baru
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL OPEN BILL LIST */}
      {isOpenBillListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Daftar Open Bill</h3>
              <button onClick={() => setIsOpenBillListModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {openBills.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Belum ada data Open Bill</div>
              ) : (
                openBills.map((bill) => (
                  <button
                    key={bill.id}
                    onClick={() => handleLoadBill(bill)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-gray-800 block">Meja {bill.tableNumber}</span>
                        <span className="text-xs text-gray-500">{new Date(bill.date).toLocaleString('id-ID')}</span>
                      </div>
                      <span className="font-bold text-blue-600">Rp {bill.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {bill.member ? `Member: ${bill.member.name}` : "Non-Member"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {bill.items.map((i: any) => i.name).join(", ")}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAYMENT */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalAmount}
        onPayment={processPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashAmount={cashAmount}
        setCashAmount={setCashAmount}
        changeAmount={changeAmount}
        setChangeAmount={setChangeAmount}
      />

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

    {/* PRINT RECEIPT LAYOUT */}
    <Receipt data={receiptData} />
    </>
  );
}
