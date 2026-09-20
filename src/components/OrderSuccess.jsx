import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  return (
    <div dir="rtl" className="max-w-md mx-auto px-6 py-24 text-center">
      <CheckCircle size={56} className="mx-auto text-green-600 mb-4" strokeWidth={1.5} />

      <h1 className="text-lg font-bold mb-2">تم تأكيد طلبك بنجاح!</h1>
      <p className="text-sm text-muted mb-8">
        هيتم التواصل معاك قريبًا لتأكيد تفاصيل الشحن.
      </p>

      <Link
        to="/"
        className="inline-block bg-black text-white rounded-md px-6 py-3 text-sm font-semibold"
      >
        العودة للمتجر
      </Link>
    </div>
  );
}