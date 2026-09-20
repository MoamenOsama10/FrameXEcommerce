import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { API_URL } from "../config";

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discountPercent: "", usageLimit: "" });

  const token = localStorage.getItem("accessToken");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch(`${API_URL}/promocodes`, { headers: authHeaders });
      const text = await res.text();

      if (!res.ok) {
        console.error("Fetch promo codes failed:", res.status, text);
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Fetch promo codes error:", error);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const resetForm = () => {
    setForm({ code: "", discountPercent: "", usageLimit: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/promocodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          code: form.code,
          discountPercent: parseFloat(form.discountPercent),
          usageLimit: parseInt(form.usageLimit),
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        alert(`Failed: ${res.status}\n${text}`);
        return;
      }

      setShowForm(false);
      resetForm();
      await fetchPromoCodes();
    } catch (error) {
      console.error("Promo code error:", error);
      alert("Something went wrong. Check Console.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this promo code?")) return;

    const res = await fetch(`${API_URL}/promocodes/${id}`, { method: "DELETE", headers: authHeaders });

    if (!res.ok) {
      alert("فشل الحذف.");
      return;
    }

    fetchPromoCodes();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Promo Codes</h1>
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <Plus size={16} /> Add Promo Code
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-6 mb-6 space-y-4 max-w-md">
          <input
            required
            placeholder="Code (e.g. SAVE20)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm uppercase"
          />
          <input
            required
            type="number"
            placeholder="Discount %"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
          <input
            required
            type="number"
            placeholder="Usage Limit"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium">
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-200 px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Used / Limit</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono font-semibold">{p.code}</td>
                <td className="px-4 py-3">{p.discountPercent}%</td>
                <td className="px-4 py-3">{p.usedCount} / {p.usageLimit}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(p.id)} className="text-muted hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}