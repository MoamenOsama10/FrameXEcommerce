import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import QuickAddModal from "./QuickAddModal";

export default function ProductCard({ id, imageUrl, name, basePrice }) {
  const [showModal, setShowModal] = useState(false);
  const fullImageUrl = imageUrl ? `${API_URL.replace("/api", "")}${imageUrl}` : null;

  return (
    <div className="flex-shrink-0 w-[220px]">
      <Link to={`/product/${id}`} className="block group">
        <div className="relative rounded-xl overflow-hidden bg-surface aspect-[3/4]">
          {fullImageUrl && (
            <img
              src={fullImageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          )}
        </div>
      </Link>

      <div className="mt-3">
        <p className="text-xs font-semibold tracking-wide text-text uppercase">{name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-red-600">{basePrice} EGP</span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-2 w-full border border-gray-200 rounded-md py-2 text-xs font-semibold hover:border-gray-400 transition-colors"
        >
          Add to Cart
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="mt-3 w-full bg-black text-white rounded-md py-3 text-sm font-semibold hover:bg-black/90 transition-colors"
        >
          Buy Now
        </button>
      </div>

      {showModal && (
        <QuickAddModal productId={id} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}