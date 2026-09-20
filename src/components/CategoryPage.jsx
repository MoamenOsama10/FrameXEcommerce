import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import BackButton from "./BackButton";
import { API_URL } from "../config";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      const catsRes = await fetch(`${API_URL}/categories`);
      const cats = await catsRes.json();
      const matchedCategory = cats.find((c) => c.slug === slug);

      if (!matchedCategory) {
        setProducts([]);
        setCategoryName("");
        return;
      }

      setCategoryName(matchedCategory.name);

      const res = await fetch(`${API_URL}/products?categoryId=${matchedCategory.id}&pageSize=50`);
      const data = await res.json();
      setProducts(data.items || []);
    };

    loadProducts();
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <BackButton />
      <h1 className="font-display text-2xl font-semibold mb-8">{categoryName || "Products"}</h1>

      {products.length === 0 ? (
        <p className="text-sm text-muted">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}