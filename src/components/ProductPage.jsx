import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus, ChevronRight, X, ImagePlus, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import BackButton from "./BackButton";
import { API_URL } from "../config";

// تحويل اسم المقاس من الباك اند (Small/Medium/Large) لشكل يفهمه العميل
const SIZE_LABELS = {
  Small: "20x30",
  Medium: "30x40",
  Large: "40x50",
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 ميجا، نفس حد السيرفر

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // صورة العميل (للمنتج المخصص)
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customPreview, setCustomPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // لما نفتح منتج تاني، نصفّر صورة العميل
    setCustomImageUrl("");
    setCustomPreview(null);
    setUploadError("");

    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);

        const firstVariant = data.variants && data.variants.length > 0 ? data.variants[0] : null;
        setSelectedSize(firstVariant ? firstVariant.size : "");
      });
  }, [id]);

  if (!product) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-muted">جاري التحميل...</div>;
  }

  const fullImageUrl = product.imageUrl
    ? `${API_URL.replace("/api", "")}${product.imageUrl}`
    : null;

  const variants = product.variants || [];

  // السعر بيتغير حسب الـ variant المطابق للمقاس المختار
  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;

  const handleCustomImageChange = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    // فحص سريع قبل الرفع (السيرفر بيفحص تاني وهو الحكم)
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("النوع ده مش مدعوم. ارفع صورة JPG أو PNG أو WebP.");
      input.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("حجم الصورة أكبر من 10 ميجا.");
      input.value = "";
      return;
    }

    setUploadError("");
    setUploading(true);
    setCustomImageUrl("");
    setCustomPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/orders/upload-custom-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "فشل رفع الصورة.";
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          // الرد مش JSON (مثلاً الملف أكبر من حد السيرفر)
        }
        throw new Error(message);
      }

      const data = await res.json();
      setCustomImageUrl(data.imageUrl);
    } catch (err) {
      setCustomPreview(null);
      setUploadError(err.message || "فشل رفع الصورة.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  // بترجّع true لو المنتج اتضاف للسلة
  const handleAddToCart = () => {
    if (product.isCustomizable && (!customImageUrl || uploading)) {
      setUploadError(uploading ? "استنى لحد ما الصورة تخلّص رفع." : "ارفع صورتك الأول.");
      return false;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      size: SIZE_LABELS[selectedSize] || selectedSize,
      quantity,
      image: fullImageUrl,
      customImageUrl: product.isCustomizable ? customImageUrl : null,
    });
    return true;
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <BackButton />

      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <span className="text-accent">Home</span>
        <ChevronRight size={12} />
        <span>{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">

        <div
          className="rounded-2xl overflow-hidden bg-surface aspect-[4/5] relative cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsModalOpen(true)}
        >
          {fullImageUrl && (
            <img
              src={fullImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
              style={{
                transform: isZoomed ? "scale(2)" : "scale(1)",
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-light tracking-wider uppercase mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-lg font-semibold text-red-600">
              {currentPrice} EGP
            </span>
          </div>

          {/* رفع صورة العميل: بيظهر للمنتج المخصص بس */}
          {product.isCustomizable && (
            <div className="mb-6">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Upload your image
              </p>

              {!customPreview ? (
                <label
                  htmlFor="custom-image"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg h-24 cursor-pointer hover:border-black transition-colors text-xs text-gray-500"
                >
                  <ImagePlus size={18} /> اضغط لاختيار صورتك
                </label>
              ) : (
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2">
                  <img
                    src={customPreview}
                    alt="Your photo"
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1 text-xs">
                    {uploading ? (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" /> جاري الرفع...
                      </span>
                    ) : (
                      <span className="text-green-600">تم رفع الصورة ✓</span>
                    )}
                  </div>
                  <label
                    htmlFor="custom-image"
                    className="text-xs border border-gray-300 rounded-md px-3 py-1.5 cursor-pointer hover:border-black transition-colors"
                  >
                    تغيير
                  </label>
                </div>
              )}

              <input
                id="custom-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCustomImageChange}
                className="hidden"
              />

              {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
            </div>
          )}

          {variants.length > 0 && (
            <div className="mb-8">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Size: {SIZE_LABELS[selectedSize] || selectedSize}
              </p>
              <div className="flex gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.size)}
                    className={`px-4 py-2 text-xs font-medium border transition-colors ${
                      selectedSize === v.size
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    {(SIZE_LABELS[v.size] || v.size).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center border border-gray-300 rounded-full px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 border border-black rounded-sm py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Add to cart
            </button>
          </div>

          <button
            onClick={() => {
              if (handleAddToCart()) navigate("/checkout");
            }}
            className="w-full bg-black text-white rounded-sm py-3 text-sm font-semibold hover:bg-black/80 transition-colors uppercase tracking-wide"
          >
            Buy Now
          </button>

          <ProductPolicies />
        </div>
      </div>

      {isModalOpen && fullImageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 bg-white/10 p-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
          >
            <X size={24} />
          </button>
          <img
            src={fullImageUrl}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 py-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide">
        {title} <span>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-4 text-sm text-muted space-y-3 leading-relaxed">{children}</div>}
    </div>
  );
}

function ProductPolicies() {
  return (
    <div className="mt-8">
      <AccordionSection title="Shipping Policy"><p>Orders are processed within 1-2 business days...</p></AccordionSection>
      <AccordionSection title="Return Policy"><p>We accept returns within 14 days of delivery...</p></AccordionSection>
    </div>
  );
}