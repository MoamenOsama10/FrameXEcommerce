import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import BackButton from "./BackButton";
import { useNavigate } from "react-router-dom";
export default function CartPage() {
  const { items, removeFromCart } = useCart();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
<BackButton />

      <h1 className="font-display text-2xl font-semibold mb-8">Your Cart</h1>

      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-4 border-b border-gray-100 pb-5">
            <img src={item.image} alt={item.name} className="w-20 h-24 rounded-lg object-cover bg-surface" />

            <div className="flex-1">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted mt-1">{item.size}</p>
              <p className="text-xs text-muted mt-1">الكمية: {item.quantity}</p>
              <p className="text-sm font-semibold text-red-600 mt-2">
                {item.price} EGP × {item.quantity}
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.key)}
              className="text-muted hover:text-red-600 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm font-semibold">Subtotal</span>
        <span className="text-lg font-semibold">{subtotal} EGP</span>
      </div>

     <button
  onClick={() => navigate("/checkout")}
  className="mt-6 w-full bg-black text-white rounded-md py-3 text-sm font-semibold hover:bg-black/90 transition-colors"
>
  Checkout
</button>
    </div>
  );
}