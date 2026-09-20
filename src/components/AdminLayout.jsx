import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutGrid, Tag, Percent, ShoppingBag, MessageSquare, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
export default function AdminLayout() {
  const location = useLocation();
const [ordersCount, setOrdersCount] = useState(0);

useEffect(() => {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  setOrdersCount(orders.length);
}, []);
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
    <div className="min-h-screen flex bg-base">
      <aside className="w-64 border-l border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="font-display text-lg font-bold uppercase">Admin</span>
        </div>

       <div className="px-6 py-4 border-b border-gray-100">
  <p className="text-xs text-muted mb-1">Total Orders</p>
  <p className="text-2xl font-semibold">{ordersCount}</p>
</div>

        <nav className="flex-1 p-4 space-y-1">
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

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}