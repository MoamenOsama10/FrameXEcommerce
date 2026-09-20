import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const successParam = searchParams.get("success");
    setSuccess(successParam === "true");
  }, [searchParams]);

  if (success === null) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      {success ? (
        <>
          <CheckCircle size={56} className="mx-auto text-green-600 mb-4" strokeWidth={1.5} />
          <h1 className="text-lg font-bold mb-2">تم الدفع بنجاح!</h1>
          <p className="text-sm text-muted mb-8">هيتم التواصل معاك قريبًا لتأكيد الشحن.</p>
        </>
      ) : (
        <>
          <XCircle size={56} className="mx-auto text-red-600 mb-4" strokeWidth={1.5} />
          <h1 className="text-lg font-bold mb-2">فشلت عملية الدفع</h1>
          <p className="text-sm text-muted mb-8">حاول مرة تانية أو استخدم وسيلة دفع مختلفة.</p>
        </>
      )}

      <Link to="/" className="inline-block bg-black text-white rounded-md px-6 py-3 text-sm font-semibold">
        العودة للمتجر
      </Link>
    </div>
  );
}