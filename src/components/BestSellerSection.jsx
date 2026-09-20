import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { API_URL } from "../config";
import QuickAddModal from "./QuickAddModal";
import bannerImage from "../assets/Main.jpg";

const toImageUrl = (imageUrl) =>
  imageUrl ? `${API_URL.replace("/api", "")}${imageUrl}` : null;

function BestSellerCard({ id, imageUrl, name, basePrice }) {
  const [showModal, setShowModal] = useState(false);
  const src = toImageUrl(imageUrl);

  return (
    <>
      <div className="flex-shrink-0 w-[190px] bg-white rounded-xl overflow-hidden flex flex-col">
        <Link to={`/product/${id}`} className="block group">
          <div className="aspect-[3/4] bg-surface overflow-hidden">
            {src && (
              <img
                src={src}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            )}
          </div>
        </Link>

        <div className="p-3 flex flex-col flex-1">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-text truncate">
            {name}
          </p>
          <p className="mt-1 text-sm font-semibold text-red-600">{basePrice} EGP</p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-auto pt-0 flex items-center justify-center gap-2 border border-gray-200 rounded-full py-2 text-xs font-semibold hover:border-black transition-colors"
          >
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </div>

      {showModal && (
        <QuickAddModal productId={id} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export default function BestSellerSection({ title, slug, products }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="mx-4 my-10 rounded-3xl px-4 sm:px-6 py-8"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.22), transparent 45%), #111111",
      }}
    >
      <div className="relative text-center mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide">
          {title}
        </h2>
        <div className="mx-auto mt-3 h-[3px] w-14 rounded-full bg-orange-500" />

        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-orange-500 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-orange-500 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* البانر الكبير: صورة واحدة من الـ assets */}
        <div className="relative lg:w-[38%] h-72 lg:h-auto lg:min-h-[360px] rounded-2xl overflow-hidden bg-black/40 flex-shrink-0">
          <img
            src={bannerImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <Link
            to={`/category/${slug}`}
            className="absolute bottom-4 left-4 bg-white text-black text-sm font-semibold rounded-full px-5 py-2 hover:bg-orange-500 hover:text-white transition-colors"
          >
            View All
          </Link>
        </div>

        {/* الكروت */}
        <div className="flex-1 min-w-0">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar h-full"
          >
            {products.map((product) => (
              <BestSellerCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}