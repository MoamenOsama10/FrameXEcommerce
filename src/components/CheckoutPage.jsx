import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API_URL } from "../config";
import BackButton from "./BackButton";
import { Trash2, Minus, Plus } from "lucide-react";

// ✅ قائمة المحافظات المصرية بالكامل مع أسعار الشحن من الجدول
const EGYPT_GOVERNORATES = [
  // 65 جنيه
  { label: "القاهرة", value: "القاهرة", cost: 65 },
  { label: "الجيزة", value: "الجيزة", cost: 65 },

  // 70 جنيه (بناءً على مناطق شبرا الخيمة والمرج... إلخ)
  { label: "القليوبية", value: "القليوبية", cost: 70 },

  // 85 جنيه (وجه بحري ومدن القناة)
  { label: "الإسكندرية", value: "الإسكندرية", cost: 85 },
  { label: "الدقهلية", value: "الدقهلية", cost: 85 },
  { label: "الشرقية", value: "الشرقية", cost: 85 },
  { label: "كفر الشيخ", value: "كفر الشيخ", cost: 85 },
  { label: "الغربية", value: "الغربية", cost: 85 },
  { label: "المنوفية", value: "المنوفية", cost: 85 },
  { label: "البحيرة", value: "البحيرة", cost: 85 },
  { label: "دمياط", value: "دمياط", cost: 85 },
  { label: "بورسعيد", value: "بورسعيد", cost: 85 },
  { label: "الإسماعيلية", value: "الإسماعيلية", cost: 85 },
  { label: "السويس", value: "السويس", cost: 85 },

  // 95 جنيه (الفيوم والمنيا وبني سويف)
  { label: "الفيوم", value: "الفيوم", cost: 95 },
  { label: "بني سويف", value: "بني سويف", cost: 95 },
  { label: "المنيا", value: "المنيا", cost: 95 },

  // 100 جنيه (الصعيد)
  { label: "أسيوط", value: "أسيوط", cost: 100 },
  { label: "سوهاج", value: "سوهاج", cost: 100 },
  { label: "قنا", value: "قنا", cost: 100 },
  { label: "الأقصر", value: "الأقصر", cost: 100 },
  { label: "أسوان", value: "أسوان", cost: 100 },

  // 115 جنيه (الساحل الشمالي ومرسى مطروح)
  { label: "مطروح", value: "مطروح", cost: 115 },

  // 135 جنيه (البحر الأحمر والوادي الجديد)
  { label: "البحر الأحمر", value: "البحر الأحمر", cost: 135 },
  { label: "الوادي الجديد", value: "الوادي الجديد", cost: 135 },

  // 160 جنيه (سيناء)
  { label: "جنوب سيناء", value: "جنوب سيناء", cost: 160 },
  { label: "شمال سيناء", value: "شمال سيناء", cost: 160 },
];

export default function CheckoutPage() {
  const { items, clearCart, removeFromCart, updateQuantity } = useCart(); 
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "القاهرة", // ✅ القيمة الافتراضية
    address: "",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ✅ التعديل هنا: لو المحافظة مش موجودة، الشحن هيبقى 0 بدل 60
  const selectedGov = EGYPT_GOVERNORATES.find(g => g.value === form.city);
  const baseShipping = selectedGov ? selectedGov.cost : 0; 
  const shipping = subtotal >= 1100 ? 0 : baseShipping; // لو الطلب فوق 1100 الشحن مجاني

  const discount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const total = subtotal + shipping - discount;

  const validate = () => {
    const errors = {};

    if (!/^01[0-9]{9}$/.test(form.phone)) {
      errors.phone = "رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم (يبدأ بـ 01)";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "من فضلك أدخل بريد إلكتروني صحيح";
    }

    if (form.address.trim().length < 10) {
      errors.address = "من فضلك اكتب العنوان بالتفصيل (10 أحرف على الأقل)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyPromo = async () => {
    try {
      const res = await fetch(`${API_URL}/promocodes/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput }),
      });

      const data = await res.json();

      if (data.isValid) {
        setAppliedPromo(data);
        setPromoError("");
      } else {
        setAppliedPromo(null);
        setPromoError(data.error || "كود غير صالح");
      }
    } catch (error) {
      setPromoError("حصل خطأ، حاول تاني.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (paymentMethod === "cod") {
      navigate("/deposit", {
        state: {
          total,
          form,
          items,
          paymentMethod,
          promoCode: appliedPromo ? promoInput : null,
          shippingCost: shipping, // ✅ ضفنا سعر الشحن هنا
        },
      });
      return;
    }

    if (paymentMethod === "card") {
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/orders/guest-checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            city: form.city,
            addressDetails: form.address,
            notes: form.notes,
            paymentMethod: "card",
            depositAccount: null,
            depositReceiptUrl: null,
            promoCode: appliedPromo ? promoInput : null,
            shippingCost: shipping, // ✅ ضفنا سعر الشحن هنا
            items: items.map((i) => ({
              productId: i.id,
              productName: i.name,
              quantity: i.quantity,
              price: i.price,
              size: i.size,
              customImageUrl: i.customImageUrl ?? null,
            })),
          }),
        });

        const text = await res.text();

        if (!res.ok) {
          // السيرفر بيرجّع الخطأ كـ JSON فيه error، فنعرض الرسالة بس
          let message = text;
          try {
            const parsed = JSON.parse(text);
            message = parsed.error || text;
          } catch {
            // الرد مش JSON
          }

          alert(`فشل إنشاء الطلب: ${message}`);
          setLoading(false);
          return;
        }

        const data = JSON.parse(text);

        clearCart();
        navigate("/payment", {
          state: {
            orderId: data.orderId,
            total,
            form,
          },
        });
      } catch (error) {
        console.error("Checkout error:", error);
        alert("حصل خطأ، حاول تاني.");
        setLoading(false);
      }
      return;
    }
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-6 py-10">
      <BackButton />

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-lg font-bold mb-6">من فضلك أدخل بياناتك لإتمام الطلب</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">الاسم بالكامل</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">البريد الإلكتروني</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-sm ${
                  fieldErrors.email ? "border-red-400" : "border-gray-200"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">رقم الهاتف</label>
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, "") })
                }
                placeholder="01xxxxxxxxx"
                className={`w-full border rounded-lg px-4 py-3 text-sm ${
                  fieldErrors.phone ? "border-red-400" : "border-gray-200"
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">المحافظة</label>
              {/* ✅ قائمة المحافظات الجديدة */}
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
              >
                {EGYPT_GOVERNORATES.map((gov) => (
                  <option key={gov.value} value={gov.value}>
                    {gov.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">العنوان بالتفصيل</label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder=" المراكز/المنطقة / الشارع بالتفصيل "
                className={`w-full border rounded-lg px-4 py-3 text-sm resize-none ${
                  fieldErrors.address ? "border-red-400" : "border-gray-200"
                }`}
              />
              {fieldErrors.address && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">ملاحظات الطلب</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2">اختر طريقة الدفع</label>

              <label className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 mb-2 cursor-pointer">
                <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                <span className="text-sm">الدفع عند الاستلام</span>
              </label>

              <label className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer">
                <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                <span className="text-sm">الدفع بالكارت (فيزا / ماستركارد)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-md py-3 text-sm font-semibold mt-4 disabled:opacity-50"
            >
              {loading
                ? "جاري الإرسال..."
                : paymentMethod === "card"
                ? "متابعة للدفع"
                : "تأكيد الطلب"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-sm font-bold mb-4">ملخص الطلب</h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="w-24 h-24 rounded-lg object-cover bg-surface cursor-pointer hover:opacity-80 transition-opacity"
                  />
                )}
                <div className="flex-1">
                  <p 
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="text-sm font-semibold cursor-pointer hover:text-accent transition-colors"
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-muted mb-2">{item.size}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold">{item.price} جنيه</p>
                  </div>

                </div>
                <button
                  onClick={() => removeFromCart(item.key)}
                  className="text-muted hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="كود الخصم"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium"
            >
              تطبيق
            </button>
          </div>

          {promoError && <p className="text-xs text-red-600 mt-1">{promoError}</p>}
          {appliedPromo && (
            <p className="text-xs text-green-600 mt-1">تم تطبيق خصم {appliedPromo.discountPercent}%</p>
          )}

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>إجمالي المنتجات</span>
              <span>{subtotal} جنيه</span>
            </div>
            <div className="flex justify-between">
              <span>تكلفة الشحن ({form.city})</span> {/* ✅ بيوضح اسم المحافظة */}
              <span>{shipping} جنيه</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-green-600">
                <span>الخصم</span>
                <span>-{discount.toFixed(2)} جنيه</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
              <span>الإجمالي</span>
              <span>{total.toFixed(2)} جنيه</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}