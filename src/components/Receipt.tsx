import React from "react";
import { CartItem, Member } from "../types";

interface ReceiptData {
  id: string;
  date: string;
  tableNumber: string;
  member: Member | null;
  items: CartItem[];
  total: number;
  paymentMethod: "cash" | "qris" | null;
  cashAmount: number;
  changeAmount: number;
}

interface ReceiptProps {
  data: ReceiptData | null;
}

export const Receipt: React.FC<ReceiptProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="hidden print:block print:w-[80mm] print:mx-auto print:p-4 font-mono text-black bg-white">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold uppercase">KEM - POS</h2>
        <p className="text-xs">Jl. Teknologi No. 10, Jakarta</p>
        <p className="text-xs">Telp: 0812-3456-7890</p>
      </div>

      <div className="border-b border-dashed border-black mb-2"></div>

      <div className="flex justify-between text-xs mb-1">
        <span>{new Date(data.date).toLocaleDateString("id-ID")}</span>
        <span>{new Date(data.date).toLocaleTimeString("id-ID")}</span>
      </div>
      <div className="text-xs mb-2">
        Order: #{data.id.slice(0, 8)}
        <br />
        Meja: {data.tableNumber} | {data.member ? data.member.name : "Umum"}
      </div>

      <div className="border-b border-dashed border-black mb-2"></div>

      <div className="space-y-2 mb-4">
        {data.items.map((item) => (
          <div key={item.cartId} className="text-xs">
            <div className="flex justify-between font-bold">
              <span>{item.name}</span>
              <span>
                {(item.price * item.quantity).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="text-gray-600">
              {item.quantity} x {item.price.toLocaleString("id-ID")}
              {item.modifiers &&
                item.modifiers.length > 0 &&
                ` (${item.modifiers.join(", ")})`}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{data.total.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak (10%)</span>
          <span>{(data.total * 0.1).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL</span>
          <span>{(data.total * 1.1).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>
            Bayar ({data.paymentMethod === "cash" ? "Tunai" : "QRIS"})
          </span>
          <span>{data.cashAmount?.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembali</span>
          <span>{data.changeAmount?.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="mt-8 text-center text-xs">
        <p>Terima Kasih!</p>
        <p>Barang yang dibeli tidak dapat ditukar.</p>
      </div>
    </div>
  );
};
