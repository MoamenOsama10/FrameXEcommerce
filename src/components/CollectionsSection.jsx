import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

export default function CollectionsSection() {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCollections(data || []));
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="py-16 overflow-hidden">
      <h2 className="text-center font-display text-2xl md:text-3xl font-semibold mb-10">
        Shop by Collection
      </h2>

      <div className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar px-6">
        {collections.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="flex-shrink-0 w-[180px] cursor-pointer group"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface">
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <span className="bg-black/70 text-white text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap">
                  {cat.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}