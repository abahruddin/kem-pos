import React from "react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  qtyInCart: number;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  qtyInCart,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200 flex flex-col overflow-hidden group relative"
    >
      {/* Badge Jumlah di Keranjang */}
      {qtyInCart > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10">
          {qtyInCart}
        </div>
      )}

      {/* Placeholder Image */}
      <div
        className={`h-32 w-full flex items-center justify-center text-white font-bold text-2xl ${product.color}`}
      >
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
};
