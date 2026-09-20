import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { API_URL } from "../config";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = location.state?.orderId;
  const amount = Number(location.state?.total || 0);
  const customerEmail = location.state?.form?.email;
  const customerName = location.state?.form?.name;

  const [iframeUrl, setIframeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasInitiated = useRef(false);

  useEffect(() => {
    if (!orderId || !amount) {
      navigate("/checkout");
      return;
    }

    if (hasInitiated.current) return;
    hasInitiated.current = true;

    const initiatePayment = async () => {
      try {
        const res = await fetch(`${API_URL}/payments/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            orderId,
            customerEmail,
            customerName,
          }),
        });

        const text = await res.text();

        if (!res.ok) {
          console.error("Initiate payment failed:", res.status, text);
          setError("تعذر بدء عملية الدفع. حاول مرة أخرى.");
          setLoading(false);
          return;
        }

        const data = JSON.parse(text);
        setIframeUrl(data.iframeUrl);
        setLoading(false);
      } catch (err) {
        console.error("Initiate payment error:", err);
        setError("حدث خطأ في الاتصال بالسيرفر.");
        setLoading(false);
      }
    };

    initiatePayment();
  }, [orderId, amount, customerEmail, customerName, navigate]);

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <BackButton />

      <h1 className="text-lg font-bold mb-6">الدفع بالكارت</h1>

      {loading && (
        <p className="text-sm text-muted text-center py-10">جاري تجهيز صفحة الدفع...</p>
      )}

      {error && !iframeUrl && (
        <p className="text-sm text-red-600 text-center py-10">{error}</p>
      )}

      {iframeUrl && (
        <div className="border border-gray-200 rounded-xl overflow-hidden w-full">
          <iframe
            src={iframeUrl}
            title="Paymob Payment"
            className="w-full block"
            style={{ height: "780px", border: "none" }}
          />
        </div>
      )}
    </div>
  );
}