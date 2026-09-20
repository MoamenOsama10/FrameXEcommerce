import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, Loader } from "lucide-react";
import BackButton from "./BackButton";

const API_URL = "http://localhost:5289/api";

export default function CardPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const total = location.state?.total || 0;

  const [iframeUrl, setIframeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const res = await fetch(`${API_URL}/payments/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        });

        if (!res.ok) throw new Error("Failed to initiate payment");

        const data = await res.json();
        setIframeUrl(data.iframeUrl);
      } catch (err) {
        setError("حصل خطأ في تجهيز الدفع، حاول تاني.");
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();
  }, [total]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <BackButton />

      <div className="border border-gray-200 rounded-2xl p-6 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <CreditCard size={18} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Card Payment</h1>
            <p className="text-xs text-gray-500">Secure payment via Paymob</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <p className="text-sm">Total Amount</p>
          <h2 className="text-2xl font-bold mt-1">{total} EGP</h2>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Loader size={24} className="animate-spin mb-3" />
            <p className="text-sm">جاري تجهيز صفحة الدفع...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              حاول تاني
            </button>
          </div>
        )}

        {iframeUrl && !loading && (
          <iframe
            src={iframeUrl}
            title="Paymob Payment"
            className="w-full h-[600px] rounded-lg border border-gray-200"
          />
        )}
      </div>
    </div>
  );
}