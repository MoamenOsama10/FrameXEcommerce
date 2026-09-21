import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ZoomIn } from "lucide-react"; // ضفنا أيقونة الزوم
import { useCart } from "../context/CartContext";
import { API_URL } from "../config";

const SIZE_LABELS = {
  Small: "20x30",
  Medium: "30x40",
  Large: "40x50",
};

export default function QuickAddModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  // States خاصة بالزوم
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        const firstVariant = data.variants && data.variants.length > 0 ? data.variants[0] : null;
        setSelectedSize(firstVariant ? firstVariant.size : "");
      });
  }, [productId]);

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-muted">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const fullImageUrl = product.imageUrl
    ? `${API_URL.replace("/api", "")}${product.imageUrl}`
    : null;

  const variants = product.variants || [];
  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;

  const buildCartItem = () => ({
    id: product.id,
    name: product.name,
    price: currentPrice,
    size: SIZE_LABELS[selectedSize] || selectedSize,
    quantity,
    image: fullImageUrl,
  });

  const handleAddToCart = () => {
    addToCart(buildCartItem());
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(buildCartItem(), false);
    navigate("/checkout");
  };

  // دوال التحكم في الزوم
  const handleMouseEnter = () => setIsZoomed(true);
  
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomPos({ x: 50, y: 50 }); // إعادة الصورة لمكانها الأصلي
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    // حساب نسبة مكان الماوس بالنسبة للصورة
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-4xl relative shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors z-20 text-gray-500"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* الجزء الأيسر: الصورة مع خاصية الزوم */}
          <div className="bg-gray-50 flex items-center justify-center p-8 h-full min-h-[400px]">
            {/* الحاوية المسؤولة عن الزوم */}
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {fullImageUrl && (
                <>
                  <img 
                    src={fullImageUrl} 
                    alt={product.name} 
                    className="max-w-full max-h-[500px] object-contain drop-shadow-xl transition-transform duration-200 ease-out"
                    style={{
                      transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  />
                  {/* أيقونة توضيحية بتظهر لما الماوس يعدي على الصورة */}
                  {!isZoomed && (
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn size={20} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* الجزء الأيمن: التفاصيل */}
          <div className="p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-gray-900">{product.name}</h2>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-xl font-bold text-red-600">{currentPrice} EGP</span>
            </div>

            {variants.length > 0 && (
              <div className="mt-8">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Size: <span className="text-gray-900">{SIZE_LABELS[selectedSize] || selectedSize}CM</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedSize(v.size)}
                      className={`px-5 py-2.5 text-xs font-semibold border transition-colors ${
                        selectedSize === v.size
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {(SIZE_LABELS[v.size] || v.size).toUpperCase()}CM
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.isCustomizable ? (
              // المنتج المخصص محتاج صورة العميل، وده بيتم في صفحة المنتج
              <div className="mt-8">
                <p className="text-sm text-gray-600 mb-4">المنتج ده محتاج ترفع صورتك الأول.</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.id}`);
                  }}
                  className="w-full bg-black text-white rounded-lg py-3.5 text-sm font-bold hover:bg-gray-900 transition-colors"
                >
                  UPLOAD YOUR PHOTO
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 w-32 shrink-0">
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="text-gray-500 hover:text-black transition-colors text-lg"
                    >
                      +
                    </button>
                    <span className="text-sm font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-gray-500 hover:text-black transition-colors text-lg"
                    >
                      −
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 border border-black rounded-lg py-3.5 text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Add to cart
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="mt-4 w-full bg-black text-white rounded-lg py-3.5 text-sm font-bold hover:bg-gray-900 transition-colors"
                >
                  BUY NOW
                </button>
              </>
            )}

            <button
              onClick={() => {
                onClose();
                navigate(`/product/${product.id}`);
              }}
              className="mt-6 text-sm text-gray-600 hover:text-black transition-colors flex items-center justify-center gap-2 font-medium"
            >
              View Full Details 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}