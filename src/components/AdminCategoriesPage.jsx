import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { API_URL } from "../config";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const token = localStorage.getItem("accessToken");console.log("TOKEN:", token);
  useEffect(() => {
  fetchCategories();
}, []);
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();

    console.log("Categories status:", res.status);
    console.log("Categories response:", text);

    if (!res.ok) {
      console.error("Failed to fetch categories");
      return;
    }

    const data = text ? JSON.parse(text) : [];

    setCategories(data || []);
  } catch (error) {
    console.error("Fetch categories error:", error);
  }
};
  const resetForm = () => {
    setForm({ name: "", slug: "" });
    setEditingId(null);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const url = editingId
      ? `${API_URL}/categories/${editingId}`
      : `${API_URL}/categories`;

    const method = editingId ? "PUT" : "POST";

    const body = editingId
      ? {
          id: editingId,
          name: form.name,
          slug: form.slug,
        }
      : {
          name: form.name,
          slug: form.slug,
        };

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    // مهم جدًا
    const text = await res.text();

    console.log("Status:", res.status);
    console.log("Response:", text);

    if (!res.ok) {
      alert(`Failed: ${res.status}\n${text}`);
      return;
    }

    alert(editingId ? "Category updated successfully" : "Category created successfully");

    setShowForm(false);
    resetForm();

    await fetchCategories();

  } catch (error) {
    console.error("Category Error:", error);
    alert("Something went wrong. Check Console.");
  }
};
 const handleDelete = async (id) => {
  if (!confirm("Delete this category?")) return;

  const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE", headers: authHeaders });

  if (!res.ok) {
    alert("فشل الحذف — على الأرجح فيه منتجات مرتبطة بالفئة دي، احذفهم الأول.");
    return;
  }

  fetchCategories();
};

  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug });
    setEditingId(cat.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Categories</h1>
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-6 mb-6 space-y-4 max-w-md">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
          <input
            required
            placeholder="Slug (e.g. cars-frame)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium">
              {editingId ? "Update" : "Create"}
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-muted">{c.slug}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => handleEdit(c)} className="text-muted hover:text-black">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-muted hover:text-red-600">
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