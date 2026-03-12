import React from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPayment: () => void;
  paymentMethod: "cash" | "qris" | null;
  setPaymentMethod: (method: "cash" | "qris" | null) => void;
  cashAmount: string;
  setCashAmount: (amount: string) => void;
  changeAmount: number;
  setChangeAmount: (amount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPayment,
  paymentMethod,
  setPaymentMethod,
  cashAmount,
  setCashAmount,
  changeAmount,
  setChangeAmount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {paymentMethod ? "Pembayaran" : "Pilih Metode Pembayaran"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!paymentMethod ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("cash")}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-gray-700">Tunai (Cash)</span>
              </button>
              <button
                onClick={() => setPaymentMethod("qris")}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-gray-700">QRIS</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500 mb-1">Total Tagihan</p>
                <p className="text-3xl font-bold text-gray-900">
                  Rp {(totalAmount * 1.1).toLocaleString("id-ID")}
                </p>
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nominal Diterima
                    </label>
                    <input
                      type="text"
                      value={cashAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setCashAmount(val);
                        setChangeAmount(
                          parseInt(val || "0", 10) - totalAmount * 1.1
                        );
                      }}
                      className="w-full border border-gray-300 rounded-xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      changeAmount >= 0
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Kembalian</span>
                      <span className="text-xl font-bold">
                        Rp {changeAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "qris" && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-gray-400 font-bold">QR CODE</span>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Scan QRIS di atas untuk melakukan pembayaran
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPaymentMethod(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Kembali
                </button>
                <button
                  onClick={onPayment}
                  disabled={paymentMethod === "cash" && changeAmount < 0}
                  className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-colors ${
                    paymentMethod === "cash" && changeAmount < 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                  }`}
                >
                  {paymentMethod === "cash"
                    ? "Bayar Sekarang"
                    : "Konfirmasi Lunas"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
