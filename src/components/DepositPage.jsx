import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import BackButton from "./BackButton";
import { API_URL } from "../config";

const INSTAPAY_LINK = "https://ipn.eg/S/moamenosamabakr/instapay/9svIMh";
const INSTAPAY_HANDLE = "moamenosamabakr@instapay";

export default function DepositPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const total = Number(location.state?.total || 0);
  const form = location.state?.form;
  const items = location.state?.items || [];
  const promoCode = location.state?.promoCode || null;
  const shippingCost = location.state?.shippingCost ?? null;

  const [depositAccount, setDepositAccount] = useState("");
  const [depositReceiptFile, setDepositReceiptFile] = useState(null);
  const [depositReceiptPreview, setDepositReceiptPreview] = useState(null);
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);

  if (!form || items.length === 0) {
    return <Navigate to="/checkout" replace />;
  }

  const depositAmount = total * 0.3;
  const remainingAmount = total - depositAmount;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDepositReceiptFile(file);
    setDepositReceiptPreview(URL.createObjectURL(file));
  };

  const uploadReceipt = async () => {
    const formData = new FormData();
    formData.append("file", depositReceiptFile);

    const res = await fetch(`${API_URL}/orders/upload-receipt`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let message = "فشل رفع صورة الإيصال";
      try {
        const err = await res.json();
        message = err.error || message;
      } catch {
        // الرد مش JSON
      }
      throw new Error(message);
    }

    const data = await res.json();
    return data.imageUrl;
  };

  const handleConfirm = async () => {
    if (!depositAccount.trim()) {
      alert("من فضلك أدخل اسم أو رقم الحساب الذي تم التحويل منه");
      return;
    }

    if (!depositReceiptFile) {
      alert("من فضلك ارفع صورة إيصال التحويل");
      return;
    }

    try {
      setLoading(true);

      const receiptUrl = await uploadReceipt();

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
          paymentMethod: "cod",
          depositAccount,
          depositReceiptUrl: receiptUrl,
          promoCode,
          shippingCost,
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
        console.error("Create order failed:", res.status, text);

        let message = text;
        try {
          const parsed = JSON.parse(text);
          message = parsed.error || text;
        } catch {
          // الرد مش JSON
        }

        alert(`حدث خطأ أثناء إنشاء الطلب: ${message}`);
        return;
      }

      clearCart();
      alert("تم إرسال الطلب بنجاح!");
      navigate("/order-success");
    } catch (error) {
      console.error("Create order error:", error);
      alert(
        error instanceof TypeError
          ? "حدث خطأ في الاتصال بالسيرفر"
          : error.message || "حدث خطأ غير متوقع"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto px-6 py-16">
      <BackButton />

      <h1 className="text-lg font-bold mb-2">تأكيد الطلب</h1>

      <div className="border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span>إجمالي الطلب</span>
          <span className="font-semibold">{total.toFixed(2)} جنيه</span>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-semibold">المطلوب دفعه (30% مقدم)</span>
          <span className="font-bold text-red-600">{depositAmount.toFixed(2)} جنيه</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>المتبقي عند الاستلام</span>
          <span>{remainingAmount.toFixed(2)} جنيه</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <h2 className="font-semibold text-sm mb-3">حوّل المبلغ عبر إنستاباي</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">المبلغ المطلوب تحويله</p>
            <p className="text-lg font-bold text-red-600">{depositAmount.toFixed(2)} جنيه</p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(depositAmount.toFixed(2), "amount")}
            className="text-xs border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
          >
            {copied === "amount" ? "تم النسخ ✓" : "نسخ المبلغ"}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">حساب الاستلام</p>
            <p className="text-sm font-mono font-semibold text-black">{INSTAPAY_HANDLE}</p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(INSTAPAY_HANDLE, "account")}
            className="text-xs border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
          >
            {copied === "account" ? "تم النسخ ✓" : "نسخ الحساب"}
          </button>
        </div>

        
        <a href={INSTAPAY_LINK} target="_blank" rel="noopener noreferrer" onClick={() => copyToClipboard(depositAmount.toFixed(2), "amount")} className="block w-full text-center bg-black text-white rounded-md py-3 text-sm font-semibold">تحويل عبر انستاباي</a>

        <p className="text-xs text-gray-500 mt-2 text-center">
          سيتم نسخ المبلغ تلقائياً، الصقه في خانة المبلغ داخل إنستاباي
        </p>

        <p className="text-[10px] text-gray-400 mt-3 text-center">Powered by InstaPay</p>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-medium mb-2">
          الرجاء إضافة اسم الأكونت الذي تم التحويل منه
        </label>

        <input
          type="text"
          value={depositAccount}
          onChange={(e) => setDepositAccount(e.target.value)}
          placeholder="مثال: محمد أحمد أو 01xxxxxxxxx"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-medium mb-2">صورة إيصال التحويل</label>

        {!depositReceiptPreview ? (
          <label
            htmlFor="deposit-receipt-image"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl h-32 cursor-pointer hover:border-black transition-colors"
          >
            <span className="text-xs text-gray-500">اضغط لاختيار صورة الإيصال</span>
          </label>
        ) : (
          <div className="relative">
            <img
              src={depositReceiptPreview}
              alt="Receipt"
              className="w-full h-48 rounded-xl object-cover border border-gray-200"
            />

            <button
              type="button"
              onClick={() => {
                setDepositReceiptFile(null);
                setDepositReceiptPreview(null);
              }}
              className="absolute top-2 left-2 bg-black text-white text-xs px-3 py-1 rounded-md"
            >
              تغيير الصورة
            </button>
          </div>
        )}

        <input
          id="deposit-receipt-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-black text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
      </button>
    </div>
  );
}