import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ShoppingBag,
  Wallet,
  CalendarDays,
  Receipt,
} from "lucide-react";
import { API_URL } from "../config";

const TZ = "Africa/Cairo";

// السيرفر بيرجّع الوقت UTC من غير علامة Z، فلازم نضيفها وإلا المتصفح يعتبره وقت محلي
const parseApiDate = (value) => {
  if (!value) return new Date(NaN);
  const s = String(value);
  return new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s) ? s : `${s}Z`);
};

// مفتاح اليوم بتوقيت القاهرة بشكل YYYY-MM-DD
const dayKeyOf = (date) => date.toLocaleDateString("en-CA", { timeZone: TZ });

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

function StatCard({ icon: Icon, label, value, hint, dark }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        dark ? "bg-black text-white border-black" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs ${dark ? "text-gray-300" : "text-muted"}`}>{label}</p>
        <Icon size={16} className={dark ? "text-gray-300" : "text-gray-400"} />
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {hint && (
        <p className={`text-[11px] mt-1 ${dark ? "text-gray-400" : "text-muted"}`}>{hint}</p>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  // حالة فتح وقفل الأيام يدوياً، والافتراضي إن اليوم الحالي بس مفتوح
  const [dayToggles, setDayToggles] = useState({});

  const token = localStorage.getItem("accessToken");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: authHeaders });
      const text = await res.text();
      if (!res.ok) {
        console.error("Fetch orders failed:", res.status, text);
        return;
      }
      const data = text ? JSON.parse(text) : [];
      setOrders(data || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ===== تقسيم الأوردرات بالأيام =====
  const days = useMemo(() => {
    const map = new Map();

    orders
      .map((o) => ({ ...o, _date: parseApiDate(o.createdAt) }))
      .sort((a, b) => (b._date.getTime() || 0) - (a._date.getTime() || 0))
      .forEach((o) => {
        const valid = !isNaN(o._date.getTime());
        const key = valid ? dayKeyOf(o._date) : "unknown";

        if (!map.has(key)) {
          map.set(key, { key, date: valid ? o._date : null, orders: [], total: 0 });
        }

        const group = map.get(key);
        group.orders.push(o);
        group.total += Number(o.total) || 0;
      });

    return [...map.values()];
  }, [orders]);

  const now = new Date();
  const todayKey = dayKeyOf(now);
  const yesterdayKey = dayKeyOf(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  const todayGroup = days.find((d) => d.key === todayKey);
  const todayCount = todayGroup ? todayGroup.orders.length : 0;
  const todayTotal = todayGroup ? todayGroup.total : 0;

  const allCount = orders.length;
  const allTotal = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const dayLabel = (group) => {
    if (group.key === todayKey) return "اليوم";
    if (group.key === yesterdayKey) return "أمس";
    if (!group.date) return "بدون تاريخ";
    return group.date.toLocaleDateString("ar-EG", { weekday: "long", timeZone: TZ });
  };

  const dayDateText = (group) =>
    group.date
      ? group.date.toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: TZ,
        })
      : "";

  const isDayOpen = (key) => (key in dayToggles ? dayToggles[key] : key === todayKey);

  const toggleDay = (key) =>
    setDayToggles((prev) => ({ ...prev, [key]: !isDayOpen(key) }));

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // اللون "-" معناه مفيش لون، فمنعرضوش
  const variantLabel = (item) =>
    [item.size, item.color && item.color !== "-" ? item.color : null]
      .filter(Boolean)
      .join(" · ");

  const buildReceiptMessage = (order) => {
    const total = order.total || 0;
    const deposit = total * 0.3;
    const remaining = total - deposit;

    const itemsText = (order.items || [])
      .map(
        (item) =>
          `• ${item.productName}${item.size ? ` (${item.size})` : ""} - ${item.unitPrice} × ${item.quantity}`
      )
      .join("\n");

    return [
      `مرحباً ${order.customerName}،`,
      `شكراً لطلبك من FrameX.`,
      ``,
      `رقم الطلب: ${order.orderNumber}`,
      ``,
      `المنتجات:`,
      itemsText,
      ``,
      `الشحن: ${order.shipping ?? 0} جنيه`,
      `الإجمالي: ${total} جنيه`,
      `المقدم (30%): ${deposit.toFixed(2)} جنيه`,
      `المتبقي عند الاستلام: ${remaining.toFixed(2)} جنيه`,
    ].join("\n");
  };

  const whatsappLink = (phone, message) => {
    if (!phone) return null;
    const cleaned = phone.replace(/[^0-9]/g, "");
    const withCountryCode = cleaned.startsWith("0") ? "2" + cleaned : cleaned;
    return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        alert("فشل حذف الطلب.");
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      console.error("Delete order error:", error);
      alert("حصل خطأ أثناء الحذف.");
    }
  };

  const getImageUrl = (imgUrl) => {
    if (!imgUrl) return null;
    if (imgUrl.startsWith("http")) return imgUrl;
    return `${API_URL.replace("/api", "")}${imgUrl}`;
  };

  const renderOrder = (order) => {
    const totalAmount = order.total || 0;
    const depositAmount = totalAmount * 0.3;
    const remainingAmount = totalAmount - depositAmount;
    const shippingCost = order.shipping ?? 0;

    const timeText = isNaN(order._date.getTime())
      ? ""
      : order._date.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: TZ,
        });

    return (
      <div key={order.id} className="border-t border-gray-100">
        <button
          onClick={() => toggleExpand(order.id)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-right"
        >
          <div>
            <p className="text-sm font-semibold">{order.orderNumber}</p>
            <p className="text-xs text-muted mt-1">
              {timeText} · {order.customerName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{fmt(order.total)} جنيه</span>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700">
              {order.status}
            </span>
            {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {expandedId === order.id && (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">إجمالي الطلب (المبلغ الكامل):</span>
                <span className="font-bold text-gray-800 text-base">{totalAmount} جنيه</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                <span className="text-green-700 font-semibold">المطلوب دفعه الآن (30% مقدم):</span>
                <span className="font-bold text-green-700 text-base">{depositAmount.toFixed(2)} جنيه</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                <span className="text-gray-500">المتبقي عند الاستلام:</span>
                <span className="font-semibold text-gray-600">{remainingAmount.toFixed(2)} جنيه</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted">الاسم</span><span className="font-medium">{order.customerName || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted">الإيميل</span><span className="font-medium">{order.customerEmail || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted">الهاتف</span><span className="font-medium">{order.customerPhone || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted">العنوان</span><span className="font-medium">{order.city} - {order.addressDetails}</span></div>
              <div className="flex justify-between">
                <span className="text-muted">تكلفة الشحن ({order.city})</span>
                <span className="font-medium text-blue-600">{shippingCost} جنيه</span>
              </div>
              {order.notes && <div className="flex justify-between"><span className="text-muted">ملاحظات</span><span className="font-medium">{order.notes}</span></div>}
            </div>

{order.customerPhone && (
  <a href={whatsappLink(order.customerPhone, buildReceiptMessage(order))} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors"><MessageCircle size={16} /> تواصل عبر واتساب</a>
)}

            {order.items && order.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted">المنتجات</p>
                {order.items.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      {item.imageUrl && (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.productName}
                          className="w-20 h-24 rounded-md object-cover bg-surface"
                        />
                      )}
                      <span className="flex-1">{item.productName}</span>
                      <span className="text-muted">{variantLabel(item)}</span>
                      <span>{item.unitPrice} × {item.quantity}</span>
                    </div>

                    {item.customImageUrl && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-orange-800 mb-2">صورة العميل (للطباعة)</p>
                        <a href={getImageUrl(item.customImageUrl)} target="_blank" rel="noopener noreferrer">
                          <img
                            src={getImageUrl(item.customImageUrl)}
                            alt="Customer photo"
                            className="w-32 h-32 rounded-md object-cover border border-orange-200"
                          />
                        </a>
                      <a href={getImageUrl(item.customImageUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs font-semibold text-orange-800 underline">فتح الصورة بالحجم الكامل</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {order.depositAccount && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold mb-3">تفاصيل الدفع</p>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted">طريقة الدفع:</span> {order.paymentMethod || "-"}</p>
                  <p><span className="text-muted">الحساب / المحفظة:</span> <span className="font-mono">{order.depositAccount}</span></p>
                </div>
                {order.depositReceiptUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-muted mb-2">صورة التحويل</p>
                    <img src={getImageUrl(order.depositReceiptUrl)} alt="Transfer receipt" className="w-48 h-48 rounded-lg object-cover border border-gray-200" />
                  </div>
                )}
              </div>
            )}

            <button onClick={() => handleDelete(order.id)} className="w-full border border-red-200 text-red-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors">
              حذف الطلب
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">الطلبات</h1>
        <span className="text-sm text-muted">{allCount} طلب</span>
      </div>

      {/* ملخص سريع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          dark
          icon={ShoppingBag}
          label="طلبات اليوم"
          value={todayCount}
          hint={dayDateText({ date: now })}
        />
        <StatCard
          icon={Wallet}
          label="إجمالي مبيعات اليوم"
          value={`${fmt(todayTotal)} جنيه`}
        />
        <StatCard
          icon={Receipt}
          label="كل الطلبات"
          value={allCount}
          hint={`${days.length} يوم`}
        />
        <StatCard
          icon={CalendarDays}
          label="إجمالي كل المبيعات"
          value={`${fmt(allTotal)} جنيه`}
        />
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted">لا توجد طلبات بعد.</p>
      ) : (
        <div className="space-y-4">
          {days.map((group) => {
            const open = isDayOpen(group.key);

            return (
              <div key={group.key} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleDay(group.key)}
                  className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-right"
                >
                  <div>
                    <p className="text-sm font-bold">{dayLabel(group)}</p>
                    <p className="text-xs text-muted mt-1">{dayDateText(group)}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[11px] text-muted">عدد الطلبات</p>
                      <p className="text-sm font-bold">{group.orders.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-muted">إجمالي اليوم</p>
                      <p className="text-sm font-bold">{fmt(group.total)} جنيه</p>
                    </div>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && <div>{group.orders.map(renderOrder)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}