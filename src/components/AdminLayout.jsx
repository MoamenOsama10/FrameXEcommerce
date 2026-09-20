import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Tag,
  Percent,
  ShoppingBag,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const location = useLocation();
  const [ordersCount, setOrdersCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrdersCount(orders.length);
  }, []);

  // اقفل القايمة لما الصفحة تتغير
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/admin/products", label: "Products", icon: LayoutGrid },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/promo-codes", label: "Promo Codes", icon: Percent },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen md:flex bg-base">
      {/* شريط علوي للموبيل بس */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3">
        <span className="font-display text-lg font-bold uppercase">Admin</span>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-50"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* خلفية معتمة على الموبيل */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-100 flex flex-col
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "translate-x-full"}
          md:static md:z-auto md:translate-x-0 md:shrink-0`}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <span className="font-display text-lg font-bold uppercase">Admin</span>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-gray-50"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-muted mb-1">Total Orders</p>
          <p className="text-2xl font-semibold">{ordersCount}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-black text-white" : "text-muted hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 m-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* min-w-0 عشان الجداول العريضة متزقش الصفحة بره الشاشة */}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}