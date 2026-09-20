import { createContext, useContext, useState } from "react";

const CartContext = createContext();

// مفتاح السطر في السلة: نفس المنتج بمقاس مختلف أو بصورة عميل مختلفة = سطر مختلف
const cartKey = (item) => `${item.id}-${item.size ?? ""}-${item.customImageUrl ?? ""}`;

// المطابقة بالمفتاح، مع دعم قديم للأماكن اللي لسه بتبعت id المنتج
const matches = (item, key) => item.key === key || item.id === key;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addToCart = (product, openDrawer = true) => {
    const key = cartKey(product);

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + product.quantity } : i
        );
      }
      return [...prev, { ...product, key }];
    });
    if (openDrawer) setIsDrawerOpen(true);
  };

  const updateQuantity = (key, newQuantity) => {
    if (newQuantity < 1) return; // منع الكمية إنها تقل عن 1

    setItems((prev) =>
      prev.map((item) =>
        matches(item, key) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (key) =>
    setItems((prev) => prev.filter((i) => !matches(i, key)));

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}