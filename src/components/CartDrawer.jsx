import { useNavigate } from "react-router-dom";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-sm font-bold tracking-wide">CART</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-black transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {items.length === 0 ? (
            <p className="text-sm text-muted text-center mt-10">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div key={item.key} className="flex gap-4 mb-5">
                <img src={item.image} alt={item.name} className="w-16 h-20 rounded-lg object-cover bg-surface" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted">{item.size}</p>
                  <p className="text-sm font-semibold mt-1">{item.price} EGP</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.key)} className="text-muted hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
            <div className="flex justify-between mb-4 text-sm font-semibold">
              <span>Product Total</span>
              <span>{subtotal} EGP</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white rounded-md py-3 text-sm font-semibold"
            >
              CHECK OUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}