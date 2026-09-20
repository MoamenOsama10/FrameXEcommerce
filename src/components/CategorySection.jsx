import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function CategorySection({ title, slug, products }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 overflow-hidden">
      <div className="flex items-center justify-between mb-5 px-6">
        <h3 className="font-display text-sm font-bold tracking-wide uppercase border-b-2 border-text pb-1">
          {title}
        </h3>

        <div className="flex items-center gap-3">
          <Link
            to={`/category/${slug}`}
            className="text-xs font-medium border border-gray-200 rounded-full px-4 py-2 hover:border-gray-400 transition-colors"
          >
            View All
          </Link>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar px-6"
      >
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}