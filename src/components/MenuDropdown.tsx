import React from "react";

interface MenuDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenBillList: () => void;
  onLogout: () => void;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  isOpen,
  onToggle,
  onOpenBillList,
  onLogout,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
      >
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
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right">
          <button
            onClick={onOpenBillList}
            className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors border-b border-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Daftar Open Bill
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
};
