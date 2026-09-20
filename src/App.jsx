import { Routes, Route, useLocation } from "react-router-dom";
import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureBanner from "./components/FeatureBanner";
import CategorySection from "./components/CategorySection";
import BestSellerSection from "./components/BestSellerSection";
import BeforeAfterSlider from "./components/BeforeAfterSlider";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import SearchPage from "./components/SearchPage";
import CartDrawer from "./components/CartDrawer";
import CategoryPage from "./components/CategoryPage";
import CheckoutPage from "./components/CheckoutPage";
import Footer from "./components/Footer";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminProductsPage from "./components/AdminProductsPage";
import AdminCategoriesPage from "./components/AdminCategoriesPage";
import AdminPromoCodesPage from "./components/AdminPromoCodesPage";
import AdminOrdersPage from "./components/AdminOrdersPage";
import AdminLoginPage from "./components/AdminLoginPage";
import DepositPage from "./components/DepositPage";
import CardPaymentPage from "./components/CardPaymentPage";
import OrderSuccess from "./components/OrderSuccess";
import { useCart } from "./context/CartContext";
import emptyWall from "./assets/before-wall.png";
import framedWall from "./assets/after-wall.png";
import PaymentCallback from "./components/PaymentCallback";
import AdminMessagesPage from "./components/AdminMessagesPage";
import PaymentPage from "./components/PaymentPage";
import AnimatedGridBackground from "./components/AnimatedGridBackground";

import { useState, useEffect } from "react";
import { API_URL } from "./config";

// الكاتيجوري اللي اسمها أو الـ slug بتاعها BestSeller (بغض النظر عن الحروف والمسافات)
const isBestSeller = (cat) =>
  [cat.slug, cat.name].some(
    (v) => (v || "").toLowerCase().replace(/[\s_-]/g, "") === "bestseller"
  );

function HomePage() {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);

  useEffect(() => {
    const loadHomeData = async () => {
      const catsRes = await fetch(`${API_URL}/categories`);
      const categories = await catsRes.json();

      const results = await Promise.all(
        categories.map(async (cat) => {
          const res = await fetch(`${API_URL}/products?categoryId=${cat.id}&pageSize=20`);
          const data = await res.json();
          return { ...cat, products: data.items || [] };
        })
      );

      setCategoriesWithProducts(results.filter((c) => c.products.length > 0));
    };

    loadHomeData();
  }, []);

  const bestSeller = categoriesWithProducts.find(isBestSeller);
  const others = categoriesWithProducts.filter((c) => !isBestSeller(c));

  const renderCategory = (cat) => (
    <CategorySection
      key={cat.id}
      title={cat.name}
      slug={cat.slug}
      products={cat.products}
    />
  );

  return (
    <>
      <Hero />
      <FeatureBanner />

      {/* أول كاتيجوريين */}
      {others.slice(0, 2).map(renderCategory)}

      {/* BestSeller دايماً بعدهم */}
      {bestSeller && (
        <BestSellerSection
          key={bestSeller.id}
          title={bestSeller.name}
          slug={bestSeller.slug}
          products={bestSeller.products}
        />
      )}

      {/* باقي الكاتيجوريز */}
      {others.slice(2).map(renderCategory)}

      <BeforeAfterSlider beforeImage={emptyWall} afterImage={framedWall} />
    </>
  );
}

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { isDrawerOpen, setIsDrawerOpen } = useCart();

  return (
    <div className="min-h-screen bg-base relative">
      <AnimatedGridBackground />

      {isHome && <AnnouncementBar />}
      <div className="relative z-10">
        {isHome && <Navbar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/card-payment" element={<CardPaymentPage />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="promo-codes" element={<AdminPromoCodesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
          </Route>
        </Routes>
      </div>

      {isHome && <Footer />}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}

export default App;